import { MemberRole, UserSession } from "@/lib/types";

export interface PermissionCheckOptions {
  requiredRole?: MemberRole[];
  allowSuperAdmin?: boolean;
}

export function canAccessAdmin(session: UserSession | null): boolean {
  return Boolean(session?.isSuperAdmin);
}

export function canAccessTenant(
  session: UserSession | null,
  targetOrgId: string,
  requiredRoles: MemberRole[] = ["OWNER", "SALES_MANAGER", "SALESPERSON"]
): boolean {
  if (!session) return false;
  // Strict tenant data privacy: Super Admins CANNOT directly access or view tenant CRM portals.
  // Access requires active membership within this specific organization.
  if (session.activeOrgId !== targetOrgId) return false;
  if (!session.activeRole) return false;
  return requiredRoles.includes(session.activeRole);
}

export function canManageTenantSettings(session: UserSession | null, orgId: string): boolean {
  return canAccessTenant(session, orgId, ["OWNER"]);
}

export function canManageTeam(session: UserSession | null, orgId: string): boolean {
  return canAccessTenant(session, orgId, ["OWNER"]);
}

export function canManageProjects(session: UserSession | null, orgId: string): boolean {
  return canAccessTenant(session, orgId, ["OWNER", "SALES_MANAGER"]);
}

export function canAssignLeads(session: UserSession | null, orgId: string): boolean {
  return canAccessTenant(session, orgId, ["OWNER", "SALES_MANAGER"]);
}

export function canViewLead(
  session: UserSession | null,
  orgId: string,
  leadAssignedMemberId?: string | null
): boolean {
  if (!session) return false;
  // Strict tenant data privacy: Super Admins CANNOT inspect private builder leads.
  if (session.activeOrgId !== orgId) return false;
  if (session.activeRole === "OWNER" || session.activeRole === "SALES_MANAGER") return true;
  if (session.activeRole === "SALESPERSON") {
    // A salesperson can view unassigned leads or leads assigned to themselves
    if (!leadAssignedMemberId) return true;
    return session.userId === leadAssignedMemberId;
  }
  return false;
}

export function canEditLead(
  session: UserSession | null,
  orgId: string,
  leadAssignedMemberId?: string | null
): boolean {
  return canViewLead(session, orgId, leadAssignedMemberId);
}
