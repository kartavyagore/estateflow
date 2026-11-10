import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");
  if (!orgSlug) return new Response("Missing orgSlug", { status: 400 });

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) return new Response("Organization not found", { status: 404 });

  const leads = await db.getLeads(org.id);
  const members = await db.findMembersByOrgId(org.id);
  const projects = await db.getProjects(org.id);

  // Generate CSV Header
  const headers = [
    "Lead ID",
    "Customer Name",
    "Phone",
    "Email",
    "Source",
    "Campaign",
    "Status",
    "Priority",
    "Temperature",
    "Project",
    "Assigned Agent",
    "Budget Min",
    "Budget Max",
    "Created At",
  ];

  const rows = leads.map((l) => {
    const member = members.find((m) => m.id === l.assignedToMemberId);
    const proj = projects.find((p) => p.id === l.projectId);
    return [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.email || ""}"`,
      `"${l.source}"`,
      `"${l.sourceCampaign || ""}"`,
      `"${l.status}"`,
      `"${l.priority}"`,
      `"${l.temperature}"`,
      `"${(proj?.name || "").replace(/"/g, '""')}"`,
      `"${(member?.user.name || "Unassigned").replace(/"/g, '""')}"`,
      `"${l.budgetMin || ""}"`,
      `"${l.budgetMax || ""}"`,
      `"${l.createdAt}"`,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\n");

  return new Response(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${org.slug}-leads-report.csv"`,
    },
  });
}

