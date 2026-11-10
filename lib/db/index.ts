import {
  OrgStatus,
  MemberRole,
  MemberStatus,
  SubStatus,
  LeadPriority,
  LeadTemperature,
  LeadStatus,
  ActivityType,
  KPIStats,
  LeadFilterParams,
} from "@/lib/types";
import { hashPassword } from "@/lib/auth/password";
import { prisma, isPrismaActive } from "@/lib/prisma";
import fs from "fs";
import path from "path";

// Persistence store file path for local/resilient execution
const DATA_FILE_PATH = path.join(process.cwd(), ".estateflow-db.json");

export interface DBUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isSuperAdmin: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBOrganization {
  id: string;
  name: string;
  slug: string;
  businessType?: string | null;
  businessEmail?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  status: OrgStatus;
  customDomain?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBBranding {
  id: string;
  organizationId: string;
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
  updatedAt: string;
}

export interface DBMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  capacity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  priceMonthly: number;
  maxEmployees: number;
  maxMonthlyLeads: number;
  features: string[];
  isPopular: boolean;
  createdAt: string;
}

export interface DBSubscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubStatus;
  trialEndsAt?: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  leadsUsedThisMonth: number;
  updatedAt: string;
}

export interface DBProject {
  id: string;
  organizationId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  location: string;
  propertyType: string;
  unitCategories?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBLead {
  id: string;
  organizationId: string;
  projectId?: string | null;
  assignedToMemberId?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  sourceCampaign?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  preferredLocation?: string | null;
  propertyType?: string | null;
  timeline: string;
  priority: LeadPriority;
  temperature: LeadTemperature;
  status: LeadStatus;
  requirements?: string | null;
  notes?: string | null;
  lastContactedAt?: string | null;
  nextFollowUpAt?: string | null;
  firstContactDurationSeconds?: number | null;
  metaLeadId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBActivity {
  id: string;
  organizationId: string;
  leadId: string;
  memberId?: string | null;
  type: string;
  title: string;
  description?: string | null;
  metadata?: any;
  createdAt: string;
}

export interface DBFollowUpTask {
  id: string;
  organizationId: string;
  leadId: string;
  assignedToMemberId: string;
  title: string;
  scheduledAt: string;
  completedAt?: string | null;
  status: string;
  outcomeNotes?: string | null;
  createdAt: string;
}

export interface DBSiteVisit {
  id: string;
  organizationId: string;
  leadId: string;
  projectId: string;
  assignedToMemberId: string;
  scheduledAt: string;
  completedAt?: string | null;
  status: string;
  feedback?: string | null;
  rating?: number | null;
  createdAt: string;
}

export interface DBBooking {
  id: string;
  organizationId: string;
  leadId: string;
  projectId: string;
  memberId: string;
  unitNumber: string;
  agreedDealValue: number;
  tokenAmount?: number | null;
  bookingDate: string;
  status: string;
  notes?: string | null;
  createdAt: string;
}

export interface DBMetaConnection {
  id: string;
  organizationId: string;
  metaPageId: string;
  pageName: string;
  accessToken: string;
  tokenExpiresAt?: string | null;
  status: "CONNECTED" | "EXPIRED" | "DISCONNECTED";
  lastSyncAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DBMetaFormMapping {
  id: string;
  organizationId: string;
  connectionId: string;
  metaFormId: string;
  formName: string;
  projectId?: string | null;
  defaultSource: string;
  isActive: boolean;
  createdAt: string;
}

export interface DBWebhookEvent {
  id: string;
  provider: string;
  organizationId?: string | null;
  eventType: string;
  payload: string;
  status: "PENDING" | "PROCESSED" | "FAILED";
  retryCount: number;
  error?: string | null;
  processedAt?: string | null;
  createdAt: string;
}

export interface DBAuditLog {
  id: string;
  organizationId?: string | null;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  details?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}

export interface DatabaseStore {
  users: DBUser[];
  organizations: DBOrganization[];
  brandings: DBBranding[];
  memberships: DBMembership[];
  plans: DBPlan[];
  subscriptions: DBSubscription[];
  projects: DBProject[];
  leads: DBLead[];
  activities: DBActivity[];
  tasks: DBFollowUpTask[];
  siteVisits: DBSiteVisit[];
  bookings: DBBooking[];
  metaConnections: DBMetaConnection[];
  metaFormMappings: DBMetaFormMapping[];
  webhookEvents: DBWebhookEvent[];
  auditLogs: DBAuditLog[];
}

let memoryStore: DatabaseStore | null = null;

function loadStore(): DatabaseStore {
  if (memoryStore) return memoryStore;

  if (fs.existsSync(DATA_FILE_PATH)) {
    try {
      const data = fs.readFileSync(DATA_FILE_PATH, "utf8");
      memoryStore = JSON.parse(data);
      return memoryStore!;
    } catch {
      // Fall through to empty store
    }
  }

  memoryStore = {
    users: [],
    organizations: [],
    brandings: [],
    memberships: [],
    plans: [],
    subscriptions: [],
    projects: [],
    leads: [],
    activities: [],
    tasks: [],
    siteVisits: [],
    bookings: [],
    metaConnections: [],
    metaFormMappings: [],
    webhookEvents: [],
    auditLogs: [],
  };

  return memoryStore;
}

function saveStore(): void {
  if (!memoryStore) return;
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(memoryStore, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist database store:", err);
  }
}

function cuid(): string {
  return "cl" + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

const DEFAULT_PLANS: DBPlan[] = [
  {
    id: "plan_starter",
    name: "STARTER",
    displayName: "Starter Tier",
    description: "Essential CRM tools for boutique real estate developers.",
    priceMonthly: 79,
    maxEmployees: 3,
    maxMonthlyLeads: 150,
    features: ["core_crm", "basic_branding", "lead_export"],
    isPopular: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "plan_growth",
    name: "GROWTH",
    displayName: "Growth Tier",
    description: "Full automation, Meta lead sync, and sales team management.",
    priceMonthly: 199,
    maxEmployees: 15,
    maxMonthlyLeads: 1500,
    features: ["core_crm", "full_white_label", "meta_integration", "auto_assignment", "advanced_analytics"],
    isPopular: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "plan_enterprise",
    name: "ENTERPRISE",
    displayName: "Enterprise Tier",
    description: "Unlimited scale, custom domain, priority webhook SLA, and custom roles.",
    priceMonthly: 499,
    maxEmployees: 100,
    maxMonthlyLeads: 10000,
    features: ["core_crm", "full_white_label", "meta_integration", "auto_assignment", "advanced_analytics", "custom_domains", "sla_guarantee"],
    isPopular: false,
    createdAt: new Date().toISOString(),
  },
];

/**
 * High-Level Multi-Tenant Database Client
 * Seamlessly interfaces with Supabase PostgreSQL (via Prisma) or local resilient JSON fallback.
 */
export const db = {
  async init(): Promise<void> {
    if (isPrismaActive() && prisma) {
      try {
        const admin = await prisma.user.findFirst({ where: { isSuperAdmin: true } });
        if (!admin) {
          await this.seedBootstrap();
        }
        return;
      } catch (err) {
        console.warn("Prisma init check failed, falling back to local store:", err);
      }
    }

    const store = loadStore();
    if (store.users.length === 0) {
      await this.seedBootstrap();
    }
  },

  /**
   * Clean-slate bootstrap: Seeds ONLY the 3 subscription plans and the Super Admin.
   * Absolutely NO fake organizations, fake leads, or demo accounts.
   */
  async seedBootstrap(): Promise<void> {
    const adminEmail = (process.env.SUPERADMIN_EMAIL || "kartavyagore0@gmail.com").toLowerCase().trim();
    const adminPass = process.env.SUPERADMIN_PASSWORD || "KartavyaGore@8999";
    const adminName = process.env.SUPERADMIN_NAME || "Platform Administrator";
    const passwordHash = await hashPassword(adminPass);
    const now = new Date().toISOString();

    if (isPrismaActive() && prisma) {
      try {
        // 1. Seed Plans
        for (const plan of DEFAULT_PLANS) {
          await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: {
              displayName: plan.displayName,
              description: plan.description,
              priceMonthly: plan.priceMonthly,
              maxEmployees: plan.maxEmployees,
              maxMonthlyLeads: plan.maxMonthlyLeads,
              features: JSON.stringify(plan.features),
              isPopular: plan.isPopular,
            },
            create: {
              name: plan.name,
              displayName: plan.displayName,
              description: plan.description,
              priceMonthly: plan.priceMonthly,
              maxEmployees: plan.maxEmployees,
              maxMonthlyLeads: plan.maxMonthlyLeads,
              features: JSON.stringify(plan.features),
              isPopular: plan.isPopular,
            },
          });
        }

        // 2. Seed Super Admin
        await prisma.user.upsert({
          where: { email: adminEmail },
          update: {
            name: adminName,
            passwordHash,
            isSuperAdmin: true,
            status: "ACTIVE",
          },
          create: {
            email: adminEmail,
            name: adminName,
            passwordHash,
            isSuperAdmin: true,
            status: "ACTIVE",
          },
        });

        return;
      } catch (err) {
        console.warn("Prisma bootstrap failed, seeding local store fallback:", err);
      }
    }

    // Local file fallback
    const store = loadStore();
    store.plans = DEFAULT_PLANS;

    let superAdmin = store.users.find((u) => u.email.toLowerCase() === adminEmail);
    if (!superAdmin) {
      superAdmin = {
        id: cuid(),
        email: adminEmail,
        name: adminName,
        passwordHash,
        phone: "+1-800-555-0100",
        isSuperAdmin: true,
        status: "ACTIVE",
        createdAt: now,
        updatedAt: now,
      };
      store.users.push(superAdmin);
    } else {
      superAdmin.passwordHash = passwordHash;
      superAdmin.name = adminName;
      superAdmin.isSuperAdmin = true;
      superAdmin.status = "ACTIVE";
    }

    saveStore();
  },

  /**
   * Completely wipe all demo organizations, leads, visits, bookings, and team members.
   * Leaves only the 3 plans and the Super Admin account.
   */
  async cleanSlate(): Promise<void> {
    if (isPrismaActive() && prisma) {
      try {
        await prisma.$transaction([
          prisma.booking.deleteMany(),
          prisma.siteVisit.deleteMany(),
          prisma.followUpTask.deleteMany(),
          prisma.leadActivity.deleteMany(),
          prisma.leadAssignment.deleteMany(),
          prisma.lead.deleteMany(),
          prisma.metaFormMapping.deleteMany(),
          prisma.metaConnection.deleteMany(),
          prisma.project.deleteMany(),
          prisma.invitation.deleteMany(),
          prisma.organizationSubscription.deleteMany(),
          prisma.tenantBranding.deleteMany(),
          prisma.organizationMembership.deleteMany(),
          prisma.organization.deleteMany(),
          prisma.auditLog.deleteMany(),
          prisma.notification.deleteMany(),
          prisma.user.deleteMany({ where: { isSuperAdmin: false } }),
        ]);
      } catch (err) {
        console.warn("Prisma cleanSlate error:", err);
      }
    }

    // Clean local store
    const store = loadStore();
    store.organizations = [];
    store.brandings = [];
    store.memberships = [];
    store.subscriptions = [];
    store.projects = [];
    store.leads = [];
    store.activities = [];
    store.tasks = [];
    store.siteVisits = [];
    store.bookings = [];
    store.metaConnections = [];
    store.metaFormMappings = [];
    store.webhookEvents = [];
    store.auditLogs = [];
    const adminEmail = (process.env.SUPERADMIN_EMAIL || "kartavyagore0@gmail.com").toLowerCase().trim();
    store.users = store.users.filter((u) => u.email.toLowerCase() === adminEmail);

    saveStore();
    await this.seedBootstrap();
  },

  // -------------------------------------------------------------
  // USER METHODS
  // -------------------------------------------------------------
  async findUserByEmail(email: string): Promise<DBUser | null> {
    if (isPrismaActive() && prisma) {
      try {
        const u = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (u) {
          return {
            ...u,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma findUserByEmail fallback:", err);
      }
    }

    const store = loadStore();
    return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  async findUserById(id: string): Promise<DBUser | null> {
    if (isPrismaActive() && prisma) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        if (u) {
          return {
            ...u,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma findUserById fallback:", err);
      }
    }

    const store = loadStore();
    return store.users.find((u) => u.id === id) || null;
  },

  async createUser(data: Omit<DBUser, "id" | "createdAt" | "updatedAt">): Promise<DBUser> {
    if (isPrismaActive() && prisma) {
      try {
        const u = await prisma.user.create({
          data: {
            email: data.email.toLowerCase().trim(),
            name: data.name,
            passwordHash: data.passwordHash,
            phone: data.phone || null,
            avatarUrl: data.avatarUrl || null,
            isSuperAdmin: data.isSuperAdmin || false,
            status: data.status || "ACTIVE",
          },
        });
        return {
          ...u,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createUser fallback:", err);
      }
    }

    const store = loadStore();
    const now = new Date().toISOString();
    const newUser: DBUser = {
      id: cuid(),
      ...data,
      email: data.email.toLowerCase().trim(),
      createdAt: now,
      updatedAt: now,
    };
    store.users.push(newUser);
    saveStore();
    return newUser;
  },

  // -------------------------------------------------------------
  // ORGANIZATION METHODS
  // -------------------------------------------------------------
  async findOrganizations(): Promise<DBOrganization[]> {
    if (isPrismaActive() && prisma) {
      try {
        const orgs = await prisma.organization.findMany({ orderBy: { createdAt: "desc" } });
        return orgs.map((o) => ({
          ...o,
          status: o.status as OrgStatus,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma findOrganizations fallback:", err);
      }
    }

    const store = loadStore();
    return [...store.organizations];
  },

  async findOrganizationById(id: string): Promise<DBOrganization | null> {
    if (isPrismaActive() && prisma) {
      try {
        const o = await prisma.organization.findUnique({ where: { id } });
        if (o) {
          return {
            ...o,
            status: o.status as OrgStatus,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma findOrganizationById fallback:", err);
      }
    }

    const store = loadStore();
    return store.organizations.find((o) => o.id === id) || null;
  },

  async findOrganizationBySlug(slug: string): Promise<DBOrganization | null> {
    if (isPrismaActive() && prisma) {
      try {
        const o = await prisma.organization.findUnique({ where: { slug: slug.toLowerCase() } });
        if (o) {
          return {
            ...o,
            status: o.status as OrgStatus,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma findOrganizationBySlug fallback:", err);
      }
    }

    const store = loadStore();
    return store.organizations.find((o) => o.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async createOrganization(
    data: Omit<DBOrganization, "id" | "createdAt" | "updatedAt">
  ): Promise<DBOrganization> {
    if (isPrismaActive() && prisma) {
      try {
        const o = await prisma.organization.create({
          data: {
            name: data.name,
            slug: data.slug.toLowerCase(),
            businessType: data.businessType || null,
            businessEmail: data.businessEmail || null,
            phone: data.phone || null,
            website: data.website || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            country: data.country || null,
            status: (data.status as any) || "ACTIVE",
            customDomain: data.customDomain || null,
          },
        });
        return {
          ...o,
          status: o.status as OrgStatus,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createOrganization fallback:", err);
      }
    }

    const store = loadStore();
    const now = new Date().toISOString();
    const newOrg: DBOrganization = {
      id: cuid(),
      ...data,
      slug: data.slug.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
    store.organizations.push(newOrg);
    saveStore();
    return newOrg;
  },

  async updateOrganization(id: string, updates: Partial<DBOrganization>): Promise<DBOrganization | null> {
    if (isPrismaActive() && prisma) {
      try {
        const o = await prisma.organization.update({
          where: { id },
          data: updates as any,
        });
        return {
          ...o,
          status: o.status as OrgStatus,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma updateOrganization fallback:", err);
      }
    }

    const store = loadStore();
    const org = store.organizations.find((o) => o.id === id);
    if (!org) return null;
    Object.assign(org, updates, { updatedAt: new Date().toISOString() });
    saveStore();
    return org;
  },

  // -------------------------------------------------------------
  // BRANDING METHODS
  // -------------------------------------------------------------
  async getBranding(organizationId: string): Promise<DBBranding | null> {
    if (isPrismaActive() && prisma) {
      try {
        const b = await prisma.tenantBranding.findUnique({ where: { organizationId } });
        if (b) {
          return {
            ...b,
            updatedAt: b.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma getBranding fallback:", err);
      }
    }

    const store = loadStore();
    return store.brandings.find((b) => b.organizationId === organizationId) || null;
  },

  async upsertBranding(organizationId: string, brandingData: Partial<DBBranding>): Promise<DBBranding> {
    if (isPrismaActive() && prisma) {
      try {
        const b = await prisma.tenantBranding.upsert({
          where: { organizationId },
          update: brandingData as any,
          create: {
            organizationId,
            primaryColor: brandingData.primaryColor || "#2563EB",
            secondaryColor: brandingData.secondaryColor || "#1E40AF",
            accentColor: brandingData.accentColor || "#EA580C",
            welcomeMessage: brandingData.welcomeMessage || null,
            supportEmail: brandingData.supportEmail || null,
            supportPhone: brandingData.supportPhone || null,
            logoUrl: brandingData.logoUrl || null,
            lightLogoUrl: brandingData.lightLogoUrl || null,
            darkLogoUrl: brandingData.darkLogoUrl || null,
            faviconUrl: brandingData.faviconUrl || null,
          },
        });
        return {
          ...b,
          updatedAt: b.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma upsertBranding fallback:", err);
      }
    }

    const store = loadStore();
    let branding = store.brandings.find((b) => b.organizationId === organizationId);
    const now = new Date().toISOString();

    if (!branding) {
      branding = {
        id: cuid(),
        organizationId,
        primaryColor: brandingData.primaryColor || "#2563EB",
        secondaryColor: brandingData.secondaryColor || "#1E40AF",
        accentColor: brandingData.accentColor || "#EA580C",
        welcomeMessage: brandingData.welcomeMessage || null,
        supportEmail: brandingData.supportEmail || null,
        supportPhone: brandingData.supportPhone || null,
        logoUrl: brandingData.logoUrl || null,
        lightLogoUrl: brandingData.lightLogoUrl || null,
        darkLogoUrl: brandingData.darkLogoUrl || null,
        faviconUrl: brandingData.faviconUrl || null,
        updatedAt: now,
      };
      store.brandings.push(branding);
    } else {
      Object.assign(branding, brandingData, { updatedAt: now });
    }

    saveStore();
    return branding;
  },

  // -------------------------------------------------------------
  // MEMBERSHIP METHODS
  // -------------------------------------------------------------
  async findMembershipsByUserId(userId: string): Promise<Array<DBMembership & { organization: DBOrganization }>> {
    if (isPrismaActive() && prisma) {
      try {
        const mems = await prisma.organizationMembership.findMany({
          where: { userId },
          include: { organization: true },
        });
        return mems.map((m) => ({
          id: m.id,
          organizationId: m.organizationId,
          userId: m.userId,
          role: m.role as MemberRole,
          status: m.status as MemberStatus,
          capacity: m.capacity,
          isAvailable: m.isAvailable,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
          organization: {
            ...m.organization,
            status: m.organization.status as OrgStatus,
            createdAt: m.organization.createdAt.toISOString(),
            updatedAt: m.organization.updatedAt.toISOString(),
          },
        }));
      } catch (err) {
        console.warn("Prisma findMembershipsByUserId fallback:", err);
      }
    }

    const store = loadStore();
    const userMembers = store.memberships.filter((m) => m.userId === userId);
    const result: Array<DBMembership & { organization: DBOrganization }> = [];

    for (const m of userMembers) {
      const org = store.organizations.find((o) => o.id === m.organizationId);
      if (org) {
        result.push({ ...m, organization: org });
      }
    }
    return result;
  },

  async findMembersByOrgId(organizationId: string): Promise<Array<DBMembership & { user: DBUser }>> {
    if (isPrismaActive() && prisma) {
      try {
        const mems = await prisma.organizationMembership.findMany({
          where: { organizationId },
          include: { user: true },
        });
        return mems.map((m) => ({
          id: m.id,
          organizationId: m.organizationId,
          userId: m.userId,
          role: m.role as MemberRole,
          status: m.status as MemberStatus,
          capacity: m.capacity,
          isAvailable: m.isAvailable,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
          user: {
            ...m.user,
            createdAt: m.user.createdAt.toISOString(),
            updatedAt: m.user.updatedAt.toISOString(),
          },
        }));
      } catch (err) {
        console.warn("Prisma findMembersByOrgId fallback:", err);
      }
    }

    const store = loadStore();
    const orgMembers = store.memberships.filter((m) => m.organizationId === organizationId);
    const result: Array<DBMembership & { user: DBUser }> = [];

    for (const m of orgMembers) {
      const u = store.users.find((user) => user.id === m.userId);
      if (u) {
        result.push({ ...m, user: u });
      }
    }
    return result;
  },

  async createMembership(data: Omit<DBMembership, "id" | "createdAt" | "updatedAt">): Promise<DBMembership> {
    if (isPrismaActive() && prisma) {
      try {
        const m = await prisma.organizationMembership.create({
          data: {
            organizationId: data.organizationId,
            userId: data.userId,
            role: data.role as any,
            status: data.status as any,
            capacity: data.capacity || 50,
            isAvailable: data.isAvailable ?? true,
          },
        });
        return {
          ...m,
          role: m.role as MemberRole,
          status: m.status as MemberStatus,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createMembership fallback:", err);
      }
    }

    const store = loadStore();
    const now = new Date().toISOString();
    const newMembership: DBMembership = {
      id: cuid(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.memberships.push(newMembership);
    saveStore();
    return newMembership;
  },

  async updateMembership(id: string, updates: Partial<DBMembership>): Promise<DBMembership | null> {
    if (isPrismaActive() && prisma) {
      try {
        const m = await prisma.organizationMembership.update({
          where: { id },
          data: updates as any,
        });
        return {
          ...m,
          role: m.role as MemberRole,
          status: m.status as MemberStatus,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma updateMembership fallback:", err);
      }
    }

    const store = loadStore();
    const member = store.memberships.find((m) => m.id === id);
    if (!member) return null;
    Object.assign(member, updates, { updatedAt: new Date().toISOString() });
    saveStore();
    return member;
  },

  // -------------------------------------------------------------
  // SUBSCRIPTION & PLAN METHODS
  // -------------------------------------------------------------
  async getPlans(): Promise<DBPlan[]> {
    if (isPrismaActive() && prisma) {
      try {
        const plans = await prisma.subscriptionPlan.findMany({ orderBy: { priceMonthly: "asc" } });
        return plans.map((p) => ({
          ...p,
          features: typeof p.features === "string" ? JSON.parse(p.features) : (p.features as string[]),
          createdAt: p.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getPlans fallback:", err);
      }
    }

    const store = loadStore();
    return [...store.plans];
  },

  async getSubscription(organizationId: string): Promise<(DBSubscription & { plan: DBPlan }) | null> {
    if (isPrismaActive() && prisma) {
      try {
        const sub = await prisma.organizationSubscription.findUnique({
          where: { organizationId },
          include: { plan: true },
        });
        if (sub) {
          return {
            id: sub.id,
            organizationId: sub.organizationId,
            planId: sub.planId,
            status: sub.status as SubStatus,
            trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.toISOString() : null,
            currentPeriodStart: sub.currentPeriodStart.toISOString(),
            currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
            leadsUsedThisMonth: sub.leadsUsedThisMonth,
            updatedAt: sub.updatedAt.toISOString(),
            plan: {
              ...sub.plan,
              features: typeof sub.plan.features === "string" ? JSON.parse(sub.plan.features) : (sub.plan.features as string[]),
              createdAt: sub.plan.createdAt.toISOString(),
            },
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma getSubscription fallback:", err);
      }
    }

    const store = loadStore();
    const sub = store.subscriptions.find((s) => s.organizationId === organizationId);
    if (!sub) return null;
    const plan = store.plans.find((p) => p.id === sub.planId);
    if (!plan) return null;
    return { ...sub, plan };
  },

  async upsertSubscription(
    organizationId: string,
    data: { planId: string; status: SubStatus; trialEndsAt?: string | null }
  ): Promise<DBSubscription> {
    if (isPrismaActive() && prisma) {
      try {
        const now = new Date();
        const nextMonth = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const sub = await prisma.organizationSubscription.upsert({
          where: { organizationId },
          update: {
            planId: data.planId,
            status: data.status as any,
            ...(data.trialEndsAt !== undefined ? { trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null } : {}),
          },
          create: {
            organizationId,
            planId: data.planId,
            status: data.status as any,
            trialEndsAt: data.trialEndsAt ? new Date(data.trialEndsAt) : null,
            currentPeriodStart: now,
            currentPeriodEnd: nextMonth,
            leadsUsedThisMonth: 0,
          },
        });
        return {
          id: sub.id,
          organizationId: sub.organizationId,
          planId: sub.planId,
          status: sub.status as SubStatus,
          trialEndsAt: sub.trialEndsAt ? sub.trialEndsAt.toISOString() : null,
          currentPeriodStart: sub.currentPeriodStart.toISOString(),
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
          leadsUsedThisMonth: sub.leadsUsedThisMonth,
          updatedAt: sub.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma upsertSubscription fallback:", err);
      }
    }

    const store = loadStore();
    let sub = store.subscriptions.find((s) => s.organizationId === organizationId);
    const now = new Date().toISOString();

    if (!sub) {
      sub = {
        id: cuid(),
        organizationId,
        planId: data.planId,
        status: data.status,
        trialEndsAt: data.trialEndsAt || null,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        leadsUsedThisMonth: 0,
        updatedAt: now,
      };
      store.subscriptions.push(sub);
    } else {
      sub.planId = data.planId;
      sub.status = data.status;
      if (data.trialEndsAt !== undefined) sub.trialEndsAt = data.trialEndsAt;
      sub.updatedAt = now;
    }

    saveStore();
    return sub;
  },

  // -------------------------------------------------------------
  // PROJECT METHODS
  // -------------------------------------------------------------
  async getProjects(organizationId: string): Promise<DBProject[]> {
    if (isPrismaActive() && prisma) {
      try {
        const prjs = await prisma.project.findMany({
          where: { organizationId },
          orderBy: { createdAt: "desc" },
        });
        return prjs.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getProjects fallback:", err);
      }
    }

    const store = loadStore();
    return store.projects.filter((p) => p.organizationId === organizationId);
  },

  async createProject(data: Omit<DBProject, "id" | "createdAt" | "updatedAt">): Promise<DBProject> {
    if (isPrismaActive() && prisma) {
      try {
        const p = await prisma.project.create({
          data: {
            organizationId: data.organizationId,
            name: data.name,
            code: data.code || null,
            description: data.description || null,
            location: data.location,
            propertyType: data.propertyType || "APARTMENT",
            unitCategories: data.unitCategories || null,
            priceMin: data.priceMin || null,
            priceMax: data.priceMax || null,
            status: data.status || "ACTIVE",
          },
        });
        return {
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createProject fallback:", err);
      }
    }

    const store = loadStore();
    const now = new Date().toISOString();
    const newProject: DBProject = {
      id: cuid(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.projects.push(newProject);
    saveStore();
    return newProject;
  },

  // -------------------------------------------------------------
  // LEAD METHODS
  // -------------------------------------------------------------
  async getLeads(organizationId: string, filters?: LeadFilterParams): Promise<DBLead[]> {
    if (isPrismaActive() && prisma) {
      try {
        const where: any = { organizationId };
        if (filters?.status) where.status = filters.status;
        if (filters?.source) where.source = filters.source;
        if (filters?.projectId) where.projectId = filters.projectId;
        if (filters?.assignedToMemberId) where.assignedToMemberId = filters.assignedToMemberId;
        if (filters?.priority) where.priority = filters.priority;
        if (filters?.temperature) where.temperature = filters.temperature;
        if (filters?.search) {
          const q = filters.search.trim();
          where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { phone: { contains: q } },
            { email: { contains: q, mode: "insensitive" } },
          ];
        }

        const leads = await prisma.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
        });

        return leads.map((l) => ({
          ...l,
          priority: l.priority as LeadPriority,
          temperature: l.temperature as LeadTemperature,
          status: l.status as LeadStatus,
          lastContactedAt: l.lastContactedAt ? l.lastContactedAt.toISOString() : null,
          nextFollowUpAt: l.nextFollowUpAt ? l.nextFollowUpAt.toISOString() : null,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getLeads fallback:", err);
      }
    }

    const store = loadStore();
    let leads = store.leads.filter((l) => l.organizationId === organizationId);

    if (filters) {
      if (filters.status) leads = leads.filter((l) => l.status === filters.status);
      if (filters.source) leads = leads.filter((l) => l.source === filters.source);
      if (filters.projectId) leads = leads.filter((l) => l.projectId === filters.projectId);
      if (filters.assignedToMemberId) leads = leads.filter((l) => l.assignedToMemberId === filters.assignedToMemberId);
      if (filters.priority) leads = leads.filter((l) => l.priority === filters.priority);
      if (filters.temperature) leads = leads.filter((l) => l.temperature === filters.temperature);
      if (filters.search) {
        const query = filters.search.toLowerCase();
        leads = leads.filter(
          (l) =>
            l.name.toLowerCase().includes(query) ||
            l.phone.includes(query) ||
            (l.email && l.email.toLowerCase().includes(query))
        );
      }
    }

    return leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getLeadById(organizationId: string, leadId: string): Promise<DBLead | null> {
    if (isPrismaActive() && prisma) {
      try {
        const l = await prisma.lead.findFirst({
          where: { id: leadId, organizationId },
        });
        if (l) {
          return {
            ...l,
            priority: l.priority as LeadPriority,
            temperature: l.temperature as LeadTemperature,
            status: l.status as LeadStatus,
            lastContactedAt: l.lastContactedAt ? l.lastContactedAt.toISOString() : null,
            nextFollowUpAt: l.nextFollowUpAt ? l.nextFollowUpAt.toISOString() : null,
            createdAt: l.createdAt.toISOString(),
            updatedAt: l.updatedAt.toISOString(),
          };
        }
        return null;
      } catch (err) {
        console.warn("Prisma getLeadById fallback:", err);
      }
    }

    const store = loadStore();
    return store.leads.find((l) => l.organizationId === organizationId && l.id === leadId) || null;
  },

  async createLead(data: Omit<DBLead, "id" | "createdAt" | "updatedAt">): Promise<DBLead> {
    if (isPrismaActive() && prisma) {
      try {
        const l = await prisma.lead.create({
          data: {
            organizationId: data.organizationId,
            projectId: data.projectId || null,
            assignedToMemberId: data.assignedToMemberId || null,
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            source: data.source || "MANUAL",
            sourceCampaign: data.sourceCampaign || null,
            budgetMin: data.budgetMin || null,
            budgetMax: data.budgetMax || null,
            preferredLocation: data.preferredLocation || null,
            propertyType: data.propertyType || null,
            timeline: data.timeline || "1_3_MONTHS",
            priority: (data.priority as any) || "MEDIUM",
            temperature: (data.temperature as any) || "WARM",
            status: (data.status as any) || "NEW",
            requirements: data.requirements || null,
            notes: data.notes || null,
          },
        });

        // Increment quota
        await prisma.organizationSubscription.updateMany({
          where: { organizationId: data.organizationId },
          data: { leadsUsedThisMonth: { increment: 1 } },
        });

        return {
          ...l,
          priority: l.priority as LeadPriority,
          temperature: l.temperature as LeadTemperature,
          status: l.status as LeadStatus,
          lastContactedAt: l.lastContactedAt ? l.lastContactedAt.toISOString() : null,
          nextFollowUpAt: l.nextFollowUpAt ? l.nextFollowUpAt.toISOString() : null,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createLead fallback:", err);
      }
    }

    const store = loadStore();
    const now = new Date().toISOString();
    const newLead: DBLead = {
      id: cuid(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.leads.push(newLead);

    const sub = store.subscriptions.find((s) => s.organizationId === data.organizationId);
    if (sub) {
      sub.leadsUsedThisMonth = (sub.leadsUsedThisMonth || 0) + 1;
    }

    saveStore();
    return newLead;
  },

  async updateLead(organizationId: string, leadId: string, updates: Partial<DBLead>): Promise<DBLead | null> {
    if (isPrismaActive() && prisma) {
      try {
        const lead = await prisma.lead.findFirst({ where: { id: leadId, organizationId } });
        if (!lead) return null;

        const data: any = { ...updates };
        if (updates.lastContactedAt) data.lastContactedAt = new Date(updates.lastContactedAt);
        if (updates.nextFollowUpAt) data.nextFollowUpAt = new Date(updates.nextFollowUpAt);

        const l = await prisma.lead.update({
          where: { id: leadId },
          data,
        });

        return {
          ...l,
          priority: l.priority as LeadPriority,
          temperature: l.temperature as LeadTemperature,
          status: l.status as LeadStatus,
          lastContactedAt: l.lastContactedAt ? l.lastContactedAt.toISOString() : null,
          nextFollowUpAt: l.nextFollowUpAt ? l.nextFollowUpAt.toISOString() : null,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma updateLead fallback:", err);
      }
    }

    const store = loadStore();
    const lead = store.leads.find((l) => l.organizationId === organizationId && l.id === leadId);
    if (!lead) return null;
    Object.assign(lead, updates, { updatedAt: new Date().toISOString() });
    saveStore();
    return lead;
  },

  // -------------------------------------------------------------
  // ACTIVITIES & TASKS METHODS
  // -------------------------------------------------------------
  async getActivities(organizationId: string, leadId?: string): Promise<DBActivity[]> {
    if (isPrismaActive() && prisma) {
      try {
        const acts = await prisma.leadActivity.findMany({
          where: { organizationId, ...(leadId ? { leadId } : {}) },
          orderBy: { createdAt: "desc" },
        });
        return acts.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getActivities fallback:", err);
      }
    }

    const store = loadStore();
    let activities = store.activities.filter((a) => a.organizationId === organizationId);
    if (leadId) activities = activities.filter((a) => a.leadId === leadId);
    return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createActivity(data: Omit<DBActivity, "id" | "createdAt">): Promise<DBActivity> {
    if (isPrismaActive() && prisma) {
      try {
        const a = await prisma.leadActivity.create({
          data: {
            organizationId: data.organizationId,
            leadId: data.leadId,
            memberId: data.memberId || null,
            type: data.type,
            title: data.title,
            description: data.description || null,
          },
        });
        return {
          ...a,
          createdAt: a.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createActivity fallback:", err);
      }
    }

    const store = loadStore();
    const newActivity: DBActivity = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.activities.push(newActivity);
    saveStore();
    return newActivity;
  },

  async getTasks(organizationId: string, memberId?: string): Promise<DBFollowUpTask[]> {
    if (isPrismaActive() && prisma) {
      try {
        const tasks = await prisma.followUpTask.findMany({
          where: { organizationId, ...(memberId ? { assignedToMemberId: memberId } : {}) },
          orderBy: { scheduledAt: "asc" },
        });
        return tasks.map((t) => ({
          ...t,
          scheduledAt: t.scheduledAt.toISOString(),
          completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          createdAt: t.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getTasks fallback:", err);
      }
    }

    const store = loadStore();
    let tasks = store.tasks.filter((t) => t.organizationId === organizationId);
    if (memberId) tasks = tasks.filter((t) => t.assignedToMemberId === memberId);
    return tasks.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  },

  async createTask(data: Omit<DBFollowUpTask, "id" | "createdAt">): Promise<DBFollowUpTask> {
    if (isPrismaActive() && prisma) {
      try {
        const t = await prisma.followUpTask.create({
          data: {
            organizationId: data.organizationId,
            leadId: data.leadId,
            assignedToMemberId: data.assignedToMemberId,
            title: data.title,
            scheduledAt: new Date(data.scheduledAt),
            status: data.status || "PENDING",
            outcomeNotes: data.outcomeNotes || null,
          },
        });
        return {
          ...t,
          scheduledAt: t.scheduledAt.toISOString(),
          completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          createdAt: t.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createTask fallback:", err);
      }
    }

    const store = loadStore();
    const newTask: DBFollowUpTask = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.tasks.push(newTask);
    saveStore();
    return newTask;
  },

  async updateTask(id: string, updates: Partial<DBFollowUpTask>): Promise<DBFollowUpTask | null> {
    if (isPrismaActive() && prisma) {
      try {
        const data: any = { ...updates };
        if (updates.scheduledAt) data.scheduledAt = new Date(updates.scheduledAt);
        if (updates.completedAt) data.completedAt = new Date(updates.completedAt);

        const t = await prisma.followUpTask.update({
          where: { id },
          data,
        });
        return {
          ...t,
          scheduledAt: t.scheduledAt.toISOString(),
          completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          createdAt: t.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma updateTask fallback:", err);
      }
    }

    const store = loadStore();
    const task = store.tasks.find((t) => t.id === id);
    if (!task) return null;
    Object.assign(task, updates);
    saveStore();
    return task;
  },

  // -------------------------------------------------------------
  // SITE VISITS & BOOKINGS
  // -------------------------------------------------------------
  async getSiteVisits(organizationId: string): Promise<DBSiteVisit[]> {
    if (isPrismaActive() && prisma) {
      try {
        const visits = await prisma.siteVisit.findMany({
          where: { organizationId },
          orderBy: { scheduledAt: "desc" },
        });
        return visits.map((v) => ({
          ...v,
          scheduledAt: v.scheduledAt.toISOString(),
          completedAt: v.completedAt ? v.completedAt.toISOString() : null,
          createdAt: v.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getSiteVisits fallback:", err);
      }
    }

    const store = loadStore();
    return store.siteVisits
      .filter((v) => v.organizationId === organizationId)
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  },

  async createSiteVisit(data: Omit<DBSiteVisit, "id" | "createdAt">): Promise<DBSiteVisit> {
    if (isPrismaActive() && prisma) {
      try {
        const v = await prisma.siteVisit.create({
          data: {
            organizationId: data.organizationId,
            leadId: data.leadId,
            projectId: data.projectId,
            assignedToMemberId: data.assignedToMemberId,
            scheduledAt: new Date(data.scheduledAt),
            status: data.status || "SCHEDULED",
            feedback: data.feedback || null,
            rating: data.rating || null,
          },
        });
        return {
          ...v,
          scheduledAt: v.scheduledAt.toISOString(),
          completedAt: v.completedAt ? v.completedAt.toISOString() : null,
          createdAt: v.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createSiteVisit fallback:", err);
      }
    }

    const store = loadStore();
    const newVisit: DBSiteVisit = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.siteVisits.push(newVisit);
    saveStore();
    return newVisit;
  },

  async updateSiteVisit(id: string, updates: Partial<DBSiteVisit>): Promise<DBSiteVisit | null> {
    if (isPrismaActive() && prisma) {
      try {
        const data: any = { ...updates };
        if (updates.scheduledAt) data.scheduledAt = new Date(updates.scheduledAt);
        if (updates.completedAt) data.completedAt = new Date(updates.completedAt);

        const v = await prisma.siteVisit.update({
          where: { id },
          data,
        });
        return {
          ...v,
          scheduledAt: v.scheduledAt.toISOString(),
          completedAt: v.completedAt ? v.completedAt.toISOString() : null,
          createdAt: v.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma updateSiteVisit fallback:", err);
      }
    }

    const store = loadStore();
    const visit = store.siteVisits.find((v) => v.id === id);
    if (!visit) return null;
    Object.assign(visit, updates);
    saveStore();
    return visit;
  },

  async getBookings(organizationId: string): Promise<DBBooking[]> {
    if (isPrismaActive() && prisma) {
      try {
        const bookings = await prisma.booking.findMany({
          where: { organizationId },
          orderBy: { bookingDate: "desc" },
        });
        return bookings.map((b) => ({
          ...b,
          bookingDate: b.bookingDate.toISOString(),
          createdAt: b.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getBookings fallback:", err);
      }
    }

    const store = loadStore();
    return store.bookings
      .filter((b) => b.organizationId === organizationId)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  },

  async createBooking(data: Omit<DBBooking, "id" | "createdAt">): Promise<DBBooking> {
    if (isPrismaActive() && prisma) {
      try {
        const b = await prisma.booking.create({
          data: {
            organizationId: data.organizationId,
            leadId: data.leadId,
            projectId: data.projectId,
            memberId: data.memberId,
            unitNumber: data.unitNumber,
            agreedDealValue: data.agreedDealValue,
            tokenAmount: data.tokenAmount || null,
            bookingDate: data.bookingDate ? new Date(data.bookingDate) : new Date(),
            status: data.status || "CONFIRMED",
            notes: data.notes || null,
          },
        });
        return {
          ...b,
          bookingDate: b.bookingDate.toISOString(),
          createdAt: b.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createBooking fallback:", err);
      }
    }

    const store = loadStore();
    const newBooking: DBBooking = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.bookings.push(newBooking);
    saveStore();
    return newBooking;
  },

  // -------------------------------------------------------------
  // META INTEGRATION METHODS
  // -------------------------------------------------------------
  async getMetaConnections(organizationId: string): Promise<DBMetaConnection[]> {
    if (isPrismaActive() && prisma) {
      try {
        const conns = await prisma.metaConnection.findMany({ where: { organizationId } });
        return conns.map((c) => ({
          ...c,
          status: c.status as any,
          tokenExpiresAt: c.tokenExpiresAt ? c.tokenExpiresAt.toISOString() : null,
          lastSyncAt: c.lastSyncAt ? c.lastSyncAt.toISOString() : null,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getMetaConnections fallback:", err);
      }
    }

    const store = loadStore();
    return store.metaConnections.filter((m) => m.organizationId === organizationId);
  },

  async upsertMetaConnection(
    organizationId: string,
    data: { metaPageId: string; pageName: string; accessToken: string; tokenExpiresAt?: string | null }
  ): Promise<DBMetaConnection> {
    if (isPrismaActive() && prisma) {
      try {
        const now = new Date();
        const conn = await prisma.metaConnection.upsert({
          where: {
            organizationId_metaPageId: {
              organizationId,
              metaPageId: data.metaPageId,
            },
          },
          update: {
            accessToken: data.accessToken,
            pageName: data.pageName,
            status: "CONNECTED",
            lastSyncAt: now,
          },
          create: {
            organizationId,
            metaPageId: data.metaPageId,
            pageName: data.pageName,
            accessToken: data.accessToken,
            tokenExpiresAt: data.tokenExpiresAt ? new Date(data.tokenExpiresAt) : null,
            status: "CONNECTED",
            lastSyncAt: now,
          },
        });
        return {
          ...conn,
          status: conn.status as any,
          tokenExpiresAt: conn.tokenExpiresAt ? conn.tokenExpiresAt.toISOString() : null,
          lastSyncAt: conn.lastSyncAt ? conn.lastSyncAt.toISOString() : null,
          createdAt: conn.createdAt.toISOString(),
          updatedAt: conn.updatedAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma upsertMetaConnection fallback:", err);
      }
    }

    const store = loadStore();
    let conn = store.metaConnections.find(
      (m) => m.organizationId === organizationId && m.metaPageId === data.metaPageId
    );
    const now = new Date().toISOString();

    if (!conn) {
      conn = {
        id: cuid(),
        organizationId,
        metaPageId: data.metaPageId,
        pageName: data.pageName,
        accessToken: data.accessToken,
        tokenExpiresAt: data.tokenExpiresAt || null,
        status: "CONNECTED",
        lastSyncAt: now,
        createdAt: now,
        updatedAt: now,
      };
      store.metaConnections.push(conn);
    } else {
      conn.accessToken = data.accessToken;
      conn.pageName = data.pageName;
      conn.status = "CONNECTED";
      conn.lastSyncAt = now;
      conn.updatedAt = now;
    }

    saveStore();
    return conn;
  },

  async getMetaFormMappings(organizationId: string): Promise<DBMetaFormMapping[]> {
    if (isPrismaActive() && prisma) {
      try {
        const mappings = await prisma.metaFormMapping.findMany({ where: { organizationId } });
        return mappings.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getMetaFormMappings fallback:", err);
      }
    }

    const store = loadStore();
    return store.metaFormMappings.filter((f) => f.organizationId === organizationId);
  },

  async createMetaFormMapping(data: Omit<DBMetaFormMapping, "id" | "createdAt">): Promise<DBMetaFormMapping> {
    if (isPrismaActive() && prisma) {
      try {
        const m = await prisma.metaFormMapping.create({
          data: {
            organizationId: data.organizationId,
            connectionId: data.connectionId,
            metaFormId: data.metaFormId,
            formName: data.formName,
            projectId: data.projectId || null,
            defaultSource: data.defaultSource || "FACEBOOK",
            isActive: data.isActive ?? true,
          },
        });
        return {
          ...m,
          createdAt: m.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createMetaFormMapping fallback:", err);
      }
    }

    const store = loadStore();
    const mapping: DBMetaFormMapping = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.metaFormMappings.push(mapping);
    saveStore();
    return mapping;
  },

  async createWebhookEvent(data: Omit<DBWebhookEvent, "id" | "createdAt">): Promise<DBWebhookEvent> {
    if (isPrismaActive() && prisma) {
      try {
        const ev = await prisma.webhookEvent.create({
          data: {
            provider: data.provider || "META",
            organizationId: data.organizationId || null,
            eventType: data.eventType,
            payload: data.payload,
            status: data.status || "PENDING",
            retryCount: data.retryCount || 0,
            error: data.error || null,
          },
        });
        return {
          ...ev,
          status: ev.status as any,
          processedAt: ev.processedAt ? ev.processedAt.toISOString() : null,
          createdAt: ev.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma createWebhookEvent fallback:", err);
      }
    }

    const store = loadStore();
    const event: DBWebhookEvent = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.webhookEvents.push(event);
    saveStore();
    return event;
  },

  async getWebhookEvents(organizationId?: string): Promise<DBWebhookEvent[]> {
    if (isPrismaActive() && prisma) {
      try {
        const evs = await prisma.webhookEvent.findMany({
          where: organizationId ? { organizationId } : undefined,
          orderBy: { createdAt: "desc" },
        });
        return evs.map((e) => ({
          ...e,
          status: e.status as any,
          processedAt: e.processedAt ? e.processedAt.toISOString() : null,
          createdAt: e.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getWebhookEvents fallback:", err);
      }
    }

    const store = loadStore();
    let events = store.webhookEvents;
    if (organizationId) events = events.filter((e) => e.organizationId === organizationId);
    return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // -------------------------------------------------------------
  // AUDIT LOG METHODS
  // -------------------------------------------------------------
  async logAudit(data: Omit<DBAuditLog, "id" | "createdAt">): Promise<DBAuditLog> {
    if (isPrismaActive() && prisma) {
      try {
        const l = await prisma.auditLog.create({
          data: {
            organizationId: data.organizationId || null,
            userId: data.userId || null,
            action: data.action,
            resourceType: data.resourceType,
            resourceId: data.resourceId || null,
            details: typeof data.details === "object" ? JSON.stringify(data.details) : data.details || null,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
          },
        });
        return {
          ...l,
          createdAt: l.createdAt.toISOString(),
        };
      } catch (err) {
        console.warn("Prisma logAudit fallback:", err);
      }
    }

    const store = loadStore();
    const entry: DBAuditLog = {
      id: cuid(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.auditLogs.push(entry);
    saveStore();
    return entry;
  },

  async getAuditLogs(organizationId?: string): Promise<DBAuditLog[]> {
    if (isPrismaActive() && prisma) {
      try {
        const logs = await prisma.auditLog.findMany({
          where: organizationId ? { organizationId } : undefined,
          orderBy: { createdAt: "desc" },
        });
        return logs.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
        }));
      } catch (err) {
        console.warn("Prisma getAuditLogs fallback:", err);
      }
    }

    const store = loadStore();
    let logs = store.auditLogs;
    if (organizationId) logs = logs.filter((l) => l.organizationId === organizationId);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // -------------------------------------------------------------
  // METRICS & ANALYTICS
  // -------------------------------------------------------------
  async getKPIStats(organizationId: string): Promise<KPIStats> {
    const leads = await this.getLeads(organizationId);
    const bookings = (await this.getBookings(organizationId)).filter((b) => b.status === "CONFIRMED");
    const tasks = await this.getTasks(organizationId);
    const siteVisits = await this.getSiteVisits(organizationId);

    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === "NEW").length;
    const unassignedLeads = leads.filter((l) => !l.assignedToMemberId).length;
    const activeLeads = leads.filter((l) => l.status !== "WON_BOOKED" && l.status !== "LOST").length;
    const contactedLeads = leads.filter((l) => l.status !== "NEW").length;
    const qualifiedLeads = leads.filter((l) => l.status === "QUALIFIED").length;
    const lostLeads = leads.filter((l) => l.status === "LOST").length;
    const convertedClients = leads.filter((l) => l.status === "WON_BOOKED").length;

    const followUpsDue = tasks.filter((t) => t.status === "PENDING").length;
    const overdueFollowUps = tasks.filter((t) => t.status === "OVERDUE").length;

    const siteVisitsScheduled = siteVisits.filter((v) => v.status === "SCHEDULED").length;
    const siteVisitsCompleted = siteVisits.filter((v) => v.status === "COMPLETED").length;

    const totalDealValue = bookings.reduce((sum, b) => sum + (b.agreedDealValue || 0), 0);
    const conversionRate = totalLeads > 0 ? Math.round((convertedClients / totalLeads) * 100) : 0;

    return {
      totalLeads,
      newLeads,
      unassignedLeads,
      activeLeads,
      contactedLeads,
      qualifiedLeads,
      followUpsDue,
      overdueFollowUps,
      siteVisitsScheduled,
      siteVisitsCompleted,
      bookings: bookings.length,
      convertedClients,
      lostLeads,
      conversionRate,
      totalDealValue,
    };
  },
};
