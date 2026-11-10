import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { orgSlug, type, title, description, nextFollowUpAt, callOutcome } = body;

  if (!orgSlug || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const activity = await db.createActivity({
    organizationId: org.id,
    leadId: id,
    type: type || "NOTE",
    title,
    description: description || null,
    metadata: { callOutcome },
  });

  // Update lead lastContactedAt and nextFollowUpAt if provided
  const leadUpdates: any = { lastContactedAt: new Date().toISOString() };
  if (nextFollowUpAt) {
    leadUpdates.nextFollowUpAt = nextFollowUpAt;
  }
  await db.updateLead(org.id, id, leadUpdates);

  return NextResponse.json({ success: true, activity });
}

