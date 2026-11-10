export type OrgStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "ARCHIVED";
export type MemberRole = "OWNER" | "SALES_MANAGER" | "SALESPERSON";
export type MemberStatus = "ACTIVE" | "INVITED" | "SUSPENDED";
export type SubStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELED";
export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type LeadTemperature = "HOT" | "WARM" | "COLD";
export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "SITE_VISIT_SCHEDULED"
  | "SITE_VISIT_COMPLETED"
  | "NEGOTIATION"
  | "BOOKING_IN_PROGRESS"
  | "WON_BOOKED"
  | "LOST";

export type ActivityType =
  | "CALL"
  | "EMAIL"
  | "WHATSAPP"
  | "MEETING"
  | "SITE_VISIT"
  | "NOTE"
  | "STATUS_CHANGE"
  | "ASSIGNMENT"
  | "FOLLOW_UP"
  | "BOOKING";

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
  avatarUrl?: string | null;
  activeOrgId?: string | null;
  activeOrgSlug?: string | null;
  activeRole?: MemberRole | null;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  businessType?: string | null;
  status: OrgStatus;
  planName?: string;
  employeeCount: number;
  leadCount: number;
  createdAt: string;
  lastActivity?: string;
}

export interface TenantBrandingConfig {
  organizationId: string;
  businessName: string;
  logoUrl?: string | null;
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  welcomeMessage?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
}

export interface LeadFilterParams {
  search?: string;
  status?: LeadStatus;
  source?: string;
  projectId?: string;
  assignedToMemberId?: string;
  priority?: LeadPriority;
  temperature?: LeadTemperature;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface KPIStats {
  totalLeads: number;
  newLeads: number;
  unassignedLeads: number;
  activeLeads: number;
  contactedLeads: number;
  qualifiedLeads: number;
  followUpsDue: number;
  overdueFollowUps: number;
  siteVisitsScheduled: number;
  siteVisitsCompleted: number;
  bookings: number;
  convertedClients: number;
  lostLeads: number;
  conversionRate: number;
  totalDealValue: number;
}

