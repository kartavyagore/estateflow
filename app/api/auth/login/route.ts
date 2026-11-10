import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { UserSession } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { email, password, targetOrgSlug } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Resolve tenant memberships
    const memberships = await db.findMembershipsByUserId(user.id);
    let activeOrgId: string | null = null;
    let activeOrgSlug: string | null = null;
    let activeRole: any = null;

    if (memberships.length > 0) {
      let chosen = memberships[0];
      if (targetOrgSlug) {
        const found = memberships.find((m) => m.organization.slug === targetOrgSlug);
        if (found) chosen = found;
      }
      activeOrgId = chosen.organizationId;
      activeOrgSlug = chosen.organization.slug;
      activeRole = chosen.role;
    }

    const sessionPayload: UserSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
      avatarUrl: user.avatarUrl,
      activeOrgId,
      activeOrgSlug,
      activeRole,
    };

    await setSessionCookie(sessionPayload);

    await db.logAudit({
      organizationId: activeOrgId,
      userId: user.id,
      action: "USER_LOGIN",
      resourceType: "AUTH",
      details: { email: user.email, isSuperAdmin: user.isSuperAdmin, activeRole },
    });

    let redirectUrl = "/";
    if (user.isSuperAdmin) {
      redirectUrl = "/admin";
    } else if (activeOrgSlug) {
      redirectUrl = `/org/${activeOrgSlug}`;
    }

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

