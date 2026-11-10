import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");

  if (!orgSlug) {
    return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });
  }

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const lead = await db.getLeadById(org.id, id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const activities = await db.getActivities(org.id, id);
  const tasks = await db.getTasks(org.id);
  const leadTasks = tasks.filter((t) => t.leadId === id);
  const allVisits = await db.getSiteVisits(org.id);
  const leadVisits = allVisits.filter((v) => v.leadId === id);
  const allBookings = await db.getBookings(org.id);
  const leadBookings = allBookings.filter((b) => b.leadId === id);
  const members = await db.findMembersByOrgId(org.id);
  const projects = await db.getProjects(org.id);

  const assignedMember = members.find((m) => m.id === lead.assignedToMemberId);
  const project = projects.find((p) => p.id === lead.projectId);

  return NextResponse.json({
    lead: {
      ...lead,
      assignedMemberName: assignedMember?.user.name || "Unassigned",
      projectName: project?.name || "General Inquiry",
    },
    activities,
    tasks: leadTasks,
    siteVisits: leadVisits,
    bookings: leadBookings,
    teamMembers: members.map((m) => ({ id: m.id, name: m.user.name, role: m.role })),
    projects,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { orgSlug, ...updates } = body;

  if (!orgSlug) {
    return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });
  }

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const existingLead = await db.getLeadById(org.id, id);
  if (!existingLead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  // If status changed, record activity
  if (updates.status && updates.status !== existingLead.status) {
    await db.createActivity({
      organizationId: org.id,
      leadId: id,
      type: "STATUS_CHANGE",
      title: `Status Changed to ${updates.status.replace(/_/g, " ")}`,
      description: updates.reason || `Progressed from ${existingLead.status} to ${updates.status}`,
    });
  }

  // If assigned member changed
  if (updates.assignedToMemberId && updates.assignedToMemberId !== existingLead.assignedToMemberId) {
    const members = await db.findMembersByOrgId(org.id);
    const newMember = members.find((m) => m.id === updates.assignedToMemberId);
    await db.createActivity({
      organizationId: org.id,
      leadId: id,
      type: "ASSIGNMENT",
      title: "Lead Reassigned",
      description: `Reassigned to ${newMember?.user.name || "Salesperson"}`,
    });
  }

  const updated = await db.updateLead(org.id, id, updates);

  return NextResponse.json({ success: true, lead: updated });
}

