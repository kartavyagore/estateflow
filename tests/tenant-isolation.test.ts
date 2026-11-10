import { db } from "../lib/db";
import { canAccessTenant, canManageTenantSettings } from "../lib/permissions/rbac";
import { UserSession } from "../lib/types";

export async function testTenantIsolation() {
  console.log("▶ Testing Multi-Tenant Data Isolation & RBAC Boundaries...");
  await db.init();

  let orgA = await db.findOrganizationBySlug("test-org-alpha");
  if (!orgA) {
    orgA = await db.createOrganization({
      name: "Test Builder Alpha",
      slug: "test-org-alpha",
      status: "ACTIVE",
    });
    await db.createLead({
      organizationId: orgA.id,
      name: "Alpha Lead",
      phone: "+1-555-111-2222",
      timeline: "IMMEDIATE",
      priority: "HIGH",
      temperature: "HOT",
      status: "NEW",
      source: "WEBSITE",
    });
  }

  let orgB = await db.findOrganizationBySlug("test-org-beta");
  if (!orgB) {
    orgB = await db.createOrganization({
      name: "Test Builder Beta",
      slug: "test-org-beta",
      status: "ACTIVE",
    });
    await db.createLead({
      organizationId: orgB.id,
      name: "Beta Lead",
      phone: "+1-555-333-4444",
      timeline: "IMMEDIATE",
      priority: "MEDIUM",
      temperature: "WARM",
      status: "NEW",
      source: "PORTAL",
    });
  }

  // 1. Cross-Tenant Lead Query Isolation
  const leadsA = await db.getLeads(orgA.id);
  const leadsB = await db.getLeads(orgB.id);

  if (leadsA.length === 0 || leadsB.length === 0) {
    throw new Error("Expected leads in test organizations");
  }

  for (const lead of leadsA) {
    if (lead.organizationId !== orgA.id) {
      throw new Error(`Data leak: Lead ${lead.id} with org ${lead.organizationId} found in Org A query!`);
    }
  }

  for (const lead of leadsB) {
    if (lead.organizationId !== orgB.id) {
      throw new Error(`Data leak: Lead ${lead.id} with org ${lead.organizationId} found in Org B query!`);
    }
  }

  // 2. Direct IDOR Protection: Querying lead from other org
  const singleLeadFromWrongOrg = await db.getLeadById(orgB.id, leadsA[0].id);
  if (singleLeadFromWrongOrg !== null) {
    throw new Error("IDOR Vulnerability: Organization B was able to query Organization A's lead by ID!");
  }

  // 3. RBAC Tenant Access Guards
  const sessionUserA: UserSession = {
    userId: "user_test_a_owner",
    email: "owner@testalpha.com",
    name: "Alpha Owner",
    isSuperAdmin: false,
    activeOrgId: orgA.id,
    activeOrgSlug: orgA.slug,
    activeRole: "OWNER",
  };

  const sessionSalespersonA: UserSession = {
    userId: "user_test_a_sales",
    email: "sales@testalpha.com",
    name: "Alpha Salesperson",
    isSuperAdmin: false,
    activeOrgId: orgA.id,
    activeOrgSlug: orgA.slug,
    activeRole: "SALESPERSON",
  };

  // Org A Owner trying to access Org B tenant
  const canAccessB = canAccessTenant(sessionUserA, orgB.id);
  if (canAccessB) {
    throw new Error("Security Breach: Org A Owner was granted access to Org B organization!");
  }

  // Org A Salesperson trying to manage settings
  const canSalesManageSettings = canManageTenantSettings(sessionSalespersonA, orgA.id);
  if (canSalesManageSettings) {
    throw new Error("RBAC Breach: Salesperson was allowed to manage organization settings!");
  }

  // Super Admin trying to directly access Org A tenant workspace (Data Isolation Guard)
  const sessionSuperAdmin: UserSession = {
    userId: "user_test_superadmin",
    email: "superadmin@estateflow.io",
    name: "Platform Super Admin",
    isSuperAdmin: true,
    activeOrgId: null,
    activeOrgSlug: null,
    activeRole: null,
  };
  const canSuperAdminAccessA = canAccessTenant(sessionSuperAdmin, orgA.id);
  if (canSuperAdminAccessA) {
    throw new Error("Security Breach: Platform Super Admin was granted direct access to tenant workspace!");
  }

  console.log("  ✔ Cross-tenant query isolation verified: Org A and Org B data strictly separated");
  console.log("  ✔ IDOR attack prevention verified: cross-tenant ID access blocked");
  console.log("  ✔ RBAC role hierarchy and tenant boundaries verified");
}
