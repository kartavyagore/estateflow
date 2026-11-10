import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { selectAssignee, AssigneeCandidate } from "@/lib/lead-engine/assignment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");
  if (!orgSlug) {
    return NextResponse.json({ error: "Missing orgSlug parameter" }, { status: 400 });
  }

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const status = (searchParams.get("status") as any) || undefined;
  const source = searchParams.get("source") || undefined;
  const projectId = searchParams.get("projectId") || undefined;
  const assignedToMemberId = searchParams.get("assignedToMemberId") || undefined;
  const search = searchParams.get("search") || undefined;

  const leads = await db.getLeads(org.id, {
    status,
    source,
    projectId,
    assignedToMemberId,
    search,
  });

  const members = await db.findMembersByOrgId(org.id);
  const projects = await db.getProjects(org.id);

  // Hydrate assigned member and project details
  const enriched = leads.map((lead) => {
    const member = members.find((m) => m.id === lead.assignedToMemberId);
    const proj = projects.find((p) => p.id === lead.projectId);
    return {
      ...lead,
      assignedMemberName: member?.user.name || "Unassigned",
      projectName: proj?.name || "General Inquiry",
    };
  });

  return NextResponse.json({ leads: enriched });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgSlug, ...leadData } = body;

    if (!orgSlug || !leadData.name || !leadData.phone) {
      return NextResponse.json({ error: "Organization slug, lead name, and phone are required" }, { status: 400 });
    }

    const org = await db.findOrganizationBySlug(orgSlug);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Auto-assignment if not assigned manually
    let assignedMemberId = leadData.assignedToMemberId || null;
    let assignmentReason = "MANUAL";

    if (!assignedMemberId) {
      const members = await db.findMembersByOrgId(org.id);
      const allLeads = await db.getLeads(org.id);

      const candidates: AssigneeCandidate[] = members
        .filter((m) => m.role === "SALESPERSON" || m.role === "SALES_MANAGER")
        .map((m) => {
          const activeCount = allLeads.filter(
            (l) => l.assignedToMemberId === m.id && l.status !== "WON_BOOKED" && l.status !== "LOST"
          ).length;
          return {
            id: m.id,
            userId: m.userId,
            name: m.user.name,
            email: m.user.email,
            role: m.role,
            capacity: m.capacity,
            isAvailable: m.isAvailable,
            activeLeadCount: activeCount,
          };
        });

      const decision = selectAssignee(candidates, "ROUND_ROBIN");
      if (decision.isSuccessful && decision.assignedMemberId) {
        assignedMemberId = decision.assignedMemberId;
        assignmentReason = decision.reason;
      }
    }

    const newLead = await db.createLead({
      organizationId: org.id,
      projectId: leadData.projectId || null,
      assignedToMemberId: assignedMemberId,
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email || null,
      source: leadData.source || "MANUAL",
      sourceCampaign: leadData.sourceCampaign || null,
      budgetMin: leadData.budgetMin ? Number(leadData.budgetMin) : null,
      budgetMax: leadData.budgetMax ? Number(leadData.budgetMax) : null,
      preferredLocation: leadData.preferredLocation || null,
      propertyType: leadData.propertyType || "APARTMENT",
      timeline: leadData.timeline || "1_3_MONTHS",
      priority: leadData.priority || "MEDIUM",
      temperature: leadData.temperature || "WARM",
      status: leadData.status || "NEW",
      requirements: leadData.requirements || null,
      notes: leadData.notes || null,
    });

    // Record initial activity
    await db.createActivity({
      organizationId: org.id,
      leadId: newLead.id,
      memberId: assignedMemberId,
      type: "STATUS_CHANGE",
      title: "Lead Created",
      description: `Lead created from source: ${newLead.source}. Assigned via ${assignmentReason}.`,
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: any) {
    console.error("Create lead error:", err);
    return NextResponse.json({ error: err.message || "Failed to create lead" }, { status: 500 });
  }
}
