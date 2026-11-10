import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || "estateflow-fallback-super-secret-key-32-chars-long";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isTenantRoute = pathname.startsWith("/org");
  const isAdminApi = pathname.startsWith("/api/admin");
  const isTenantApi = pathname.startsWith("/api/tenant");
  const isUploadApi = pathname.startsWith("/api/upload");

  const requiresAuth = isAdminRoute || isTenantRoute || isAdminApi || isTenantApi || isUploadApi;
  if (!requiresAuth) {
    return NextResponse.next();
  }

  // 1. Extract and verify JWT session token
  const token = request.cookies.get("estateflow_session")?.value;
  let session: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // 2. Unauthenticated user trying to access protected routes -> redirect to login
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Platform Super Admin routes (/admin/*)
  if (isAdminRoute || isAdminApi) {
    if (!session.isSuperAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Forbidden: Platform Super Admin privileges required." },
          { status: 403 }
        );
      }
      if (session.activeOrgSlug) {
        return NextResponse.redirect(new URL(`/org/${session.activeOrgSlug}`, request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // 4. Tenant workspace routes (/org/:slug/*)
  if (isTenantRoute) {
    // Platform Super Admins CANNOT enter or view tenant portals directly
    if (session.isSuperAdmin) {
      const adminUrl = new URL("/admin", request.url);
      adminUrl.searchParams.set("error", "tenant_access_restricted");
      return NextResponse.redirect(adminUrl);
    }

    // Extract tenant slug
    const segments = pathname.split("/").filter(Boolean);
    const targetSlug = segments[1];

    if (targetSlug && session.activeOrgSlug !== targetSlug) {
      if (session.activeOrgSlug) {
        return NextResponse.redirect(new URL(`/org/${session.activeOrgSlug}`, request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // 5. Tenant API routes (/api/tenant/*)
  if (isTenantApi) {
    if (session.isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Platform Super Admins cannot access tenant CRM data directly." },
        { status: 403 }
      );
    }

    const orgSlug = request.nextUrl.searchParams.get("orgSlug");
    if (orgSlug && session.activeOrgSlug !== orgSlug) {
      return NextResponse.json(
        { error: "Forbidden: You do not have access to this organization." },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/org/:path*",
    "/api/admin/:path*",
    "/api/tenant/:path*",
    "/api/upload/:path*",
  ],
};

