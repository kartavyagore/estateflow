import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await db.findUserById(session.userId);
  const memberships = await db.findMembershipsByUserId(session.userId);

  return NextResponse.json({
    authenticated: true,
    user: session,
    memberships: memberships.map((m) => ({
      organizationId: m.organizationId,
      orgName: m.organization.name,
      orgSlug: m.organization.slug,
      role: m.role,
    })),
  });
}

