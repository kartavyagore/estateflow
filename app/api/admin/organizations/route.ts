import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/rbac";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
  const session = await getSession();
  if (!canAccessAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
  }

  const orgs = await db.findOrganizations();
  const plans = await db.getPlans();
  const allLeads = await db.getLeads(""); // Get all to count per org
  const fullList = [];

  for (const org of orgs) {
    const branding = await db.getBranding(org.id);
    const sub = await db.getSubscription(org.id);
    const members = await db.findMembersByOrgId(org.id);
    const leads = await db.getLeads(org.id);

    fullList.push({
      ...org,
      branding,
      subscription: sub,
      employeeCount: members.length,
      leadCount: leads.length,
      planName: sub?.plan?.displayName || "No Plan",
    });
  }

  return NextResponse.json({ organizations: fullList, plans });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!canAccessAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const {
      name,
      slug,
      businessType,
      businessEmail,
      phone,
      website,
      address,
      city,
      state,
      country,
      logoUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerPassword,
      planId,
    } = body;

    if (!name || !slug || !ownerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.findOrganizationBySlug(slug);
    if (existing) {
      return NextResponse.json({ error: "Organization slug already in use" }, { status: 400 });
    }

    // 1. Create Organization
    const org = await db.createOrganization({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      businessType,
      businessEmail,
      phone,
      website,
      address,
      city,
      state,
      country,
      status: "ACTIVE",
    });

    // 2. Create Branding
    await db.upsertBranding(org.id, {
      logoUrl: logoUrl || null,
      primaryColor: primaryColor || "#2563EB",
      secondaryColor: secondaryColor || "#1E40AF",
      accentColor: accentColor || "#EA580C",
      welcomeMessage: `Welcome to ${name} Sales Portal`,
      supportEmail: businessEmail,
      supportPhone: phone,
    });

    // 3. Create or find Owner user
    let user = await db.findUserByEmail(ownerEmail);
    if (!user) {
      const hashed = await hashPassword(ownerPassword || "Password123!");
      user = await db.createUser({
        email: ownerEmail,
        name: ownerName || "Business Owner",
        phone: ownerPhone,
        passwordHash: hashed,
        isSuperAdmin: false,
        status: "ACTIVE",
      });
    }

    // 4. Create Owner Membership
    await db.createMembership({
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
      status: "ACTIVE",
      capacity: 100,
      isAvailable: true,
    });

    // 5. Create Subscription
    const selectedPlanId = planId || (await db.getPlans())[0]?.id;
    if (selectedPlanId) {
      await db.upsertSubscription(org.id, {
        planId: selectedPlanId,
        status: "ACTIVE",
      });
    }

    // 6. Audit Log
    await db.logAudit({
      organizationId: org.id,
      userId: session?.userId,
      action: "ORGANIZATION_CREATED",
      resourceType: "ORGANIZATION",
      resourceId: org.id,
      details: { name: org.name, slug: org.slug, ownerEmail },
    });

    return NextResponse.json({ success: true, organization: org });
  } catch (err: any) {
    console.error("Create organization error:", err);
    return NextResponse.json({ error: err.message || "Failed to create organization" }, { status: 500 });
  }
}

