import { db } from "../lib/db";

export async function testAnalyticsAndSubscriptions() {
  console.log("▶ Testing Analytics, Conversion Metrics & Subscription Quotas...");
  await db.init();

  let org = await db.findOrganizationBySlug("test-org-analytics");
  if (!org) {
    org = await db.createOrganization({
      name: "Test Analytics Builder",
      slug: "test-org-analytics",
      status: "ACTIVE",
    });

    const plans = await db.getPlans();
    const growthPlan = plans.find((p) => p.name === "GROWTH") || plans[0];
    await db.upsertSubscription(org.id, {
      planId: growthPlan.id,
      status: "ACTIVE",
    });

    // Create test user and membership for foreign key validity in PostgreSQL
    const testSalesUser = await db.createUser({
      email: "test_sales_rep@example.com",
      name: "Test Sales Rep",
      passwordHash: "hash123",
      isSuperAdmin: false,
      status: "ACTIVE",
    });

    const testMember = await db.createMembership({
      organizationId: org.id,
      userId: testSalesUser.id,
      role: "SALESPERSON",
      status: "ACTIVE",
      capacity: 30,
      isAvailable: true,
    });

    // Add 4 leads
    const lead1 = await db.createLead({
      organizationId: org.id,
      name: "Client One",
      phone: "+1-555-001-1111",
      source: "WEBSITE",
      timeline: "IMMEDIATE",
      priority: "HIGH",
      temperature: "HOT",
      status: "NEW",
    });
    const lead2 = await db.createLead({
      organizationId: org.id,
      name: "Client Two",
      phone: "+1-555-001-2222",
      source: "FACEBOOK",
      timeline: "1_3_MONTHS",
      priority: "MEDIUM",
      temperature: "WARM",
      status: "QUALIFIED",
    });
    const lead3 = await db.createLead({
      organizationId: org.id,
      name: "Client Three",
      phone: "+1-555-001-3333",
      source: "INSTAGRAM",
      timeline: "IMMEDIATE",
      priority: "URGENT",
      temperature: "HOT",
      status: "WON_BOOKED",
    });
    const lead4 = await db.createLead({
      organizationId: org.id,
      name: "Client Four",
      phone: "+1-555-001-4444",
      source: "PORTAL",
      timeline: "3_6_MONTHS",
      priority: "LOW",
      temperature: "COLD",
      status: "NEW",
    });

    // Create project & booking
    const project = await db.createProject({
      organizationId: org.id,
      name: "Analytics Grand Residences",
      location: "Austin, TX",
      propertyType: "APARTMENT",
      status: "ACTIVE",
    });

    await db.createBooking({
      organizationId: org.id,
      leadId: lead3.id,
      projectId: project.id,
      memberId: testMember.id,
      unitNumber: "A-101",
      agreedDealValue: 500000,
      tokenAmount: 20000,
      bookingDate: new Date().toISOString(),
      status: "CONFIRMED",
    });
  }

  // 1. KPI Stats computation
  const stats = await db.getKPIStats(org.id);

  if (typeof stats.totalLeads !== "number" || stats.totalLeads < 4) {
    throw new Error(`Expected at least 4 leads, got ${stats.totalLeads}`);
  }

  if (typeof stats.conversionRate !== "number" || stats.conversionRate < 0 || stats.conversionRate > 100) {
    throw new Error(`Invalid conversion rate calculation: ${stats.conversionRate}`);
  }

  if (typeof stats.totalDealValue !== "number" || stats.totalDealValue <= 0) {
    throw new Error(`Expected positive deal value from bookings, got ${stats.totalDealValue}`);
  }

  // 2. Subscription verification
  const sub = await db.getSubscription(org.id);
  if (!sub || !sub.plan) throw new Error("Subscription plan not linked");

  console.log(`  ✔ Verified KPI Stats: ${stats.totalLeads} Leads, ${stats.conversionRate}% Conversion, $${stats.totalDealValue.toLocaleString()} Deal Value`);
  console.log(`  ✔ Verified Plan Quota: ${sub.plan.displayName} (Max ${sub.plan.maxEmployees} Agents, ${sub.plan.maxMonthlyLeads} Leads/mo)`);
}
