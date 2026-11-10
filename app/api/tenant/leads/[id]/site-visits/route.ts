import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { orgSlug, projectId, scheduledAt, feedback, status } = body;

  if (!orgSlug || !projectId || !scheduledAt) {
    return NextResponse.json({ error: "Missing required site visit fields" }, { status: 400 });
  }

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const lead = await db.getLeadById(org.id, id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const visit = await db.createSiteVisit({
    organizationId: org.id,
    leadId: id,
    projectId,
    assignedToMemberId: lead.assignedToMemberId || "unassigned",
    scheduledAt,
    status: status || "SCHEDULED",
    feedback: feedback || null,
  });

  // Automatically progress lead status
  const newStatus = status === "COMPLETED" ? "SITE_VISIT_COMPLETED" : "SITE_VISIT_SCHEDULED";
  await db.updateLead(org.id, id, { status: newStatus });

  // Log activity
  await db.createActivity({
    organizationId: org.id,
    leadId: id,
    type: "SITE_VISIT",
    title: status === "COMPLETED" ? "Site Visit Completed" : "Site Visit Scheduled",
    description: `Scheduled property visit for ${new Date(scheduledAt).toLocaleString()}. ${feedback || ""}`,
  });

  return NextResponse.json({ success: true, visit });
}

