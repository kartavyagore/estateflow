import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");
  if (!orgSlug) return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const members = await db.findMembersByOrgId(org.id);
  const allLeads = await db.getLeads(org.id);

  const team = members.map((m) => {
    const assignedLeads = allLeads.filter((l) => l.assignedToMemberId === m.id);
    const wonLeads = assignedLeads.filter((l) => l.status === "WON_BOOKED").length;
    return {
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      phone: m.user.phone,
      role: m.role,
      status: m.status,
      capacity: m.capacity,
      isAvailable: m.isAvailable,
      leadCount: assignedLeads.length,
      dealsWon: wonLeads,
      conversionRate: assignedLeads.length > 0 ? Math.round((wonLeads / assignedLeads.length) * 100) : 0,
    };
  });

  return NextResponse.json({ team });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgSlug, name, email, phone, role, capacity, password } = body;

    if (!orgSlug || !name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const org = await db.findOrganizationBySlug(orgSlug);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // Check plan employee limit
    const sub = await db.getSubscription(org.id);
    const currentMembers = await db.findMembersByOrgId(org.id);
    const maxAllowed = sub?.plan?.maxEmployees || 5;

    if (currentMembers.length >= maxAllowed) {
      return NextResponse.json(
        { error: `Employee limit of ${maxAllowed} reached for current ${sub?.plan?.displayName || "Subscription"} plan.` },
        { status: 403 }
      );
    }

    let user = await db.findUserByEmail(email);
    if (!user) {
      const hashed = await hashPassword(password || "Password123!");
      user = await db.createUser({
        email,
        name,
        phone: phone || null,
        passwordHash: hashed,
        isSuperAdmin: false,
        status: "ACTIVE",
      });
    }

    const membership = await db.createMembership({
      organizationId: org.id,
      userId: user.id,
      role: role || "SALESPERSON",
      status: "ACTIVE",
      capacity: capacity ? Number(capacity) : 50,
      isAvailable: true,
    });

    return NextResponse.json({ success: true, member: membership });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

