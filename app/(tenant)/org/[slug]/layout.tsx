import React, { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import TenantShell from "./TenantShell";

export const dynamic = "force-dynamic";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Must be logged in
  const session = await getSession();
  if (!session) {
    redirect(`/login?redirect=/org/${slug}`);
  }

  // 2. Platform Super Admin is prohibited from directly accessing tenant portals
  if (session.isSuperAdmin) {
    redirect("/admin?error=tenant_access_restricted");
  }

  // 3. User must belong to this specific organization
  if (session.activeOrgSlug !== slug) {
    if (session.activeOrgSlug) {
      redirect(`/org/${session.activeOrgSlug}`);
    } else {
      redirect("/login");
    }
  }

  // 4. Verify organization exists and is ACTIVE
  const org = await db.findOrganizationBySlug(slug);
  if (!org) {
    notFound();
  }

  if (org.status === "SUSPENDED" || org.status === "ARCHIVED") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-xl font-bold text-slate-900">Workspace {org.status}</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            This real estate workspace has been {org.status.toLowerCase()} by the platform administrator.
            Please contact support or your organization administrator to restore access.
          </p>
          <a
            href="/login"
            className="inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <TenantShell slug={slug}>{children}</TenantShell>
    </Suspense>
  );
}
