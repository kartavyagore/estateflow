import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { orgSlug, projectId, unitNumber, agreedDealValue, tokenAmount, notes } = body;

  if (!orgSlug || !projectId || !unitNumber || !agreedDealValue) {
    return NextResponse.json({ error: "Missing required booking fields" }, { status: 400 });
  }

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  const lead = await db.getLeadById(org.id, id);
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const booking = await db.createBooking({
    organizationId: org.id,
    leadId: id,
    projectId,
    memberId: lead.assignedToMemberId || "unassigned",
    unitNumber,
    agreedDealValue: Number(agreedDealValue),
    tokenAmount: tokenAmount ? Number(tokenAmount) : null,
    bookingDate: new Date().toISOString(),
    status: "CONFIRMED",
    notes: notes || null,
  });

  // Progress lead status to WON_BOOKED
  await db.updateLead(org.id, id, { status: "WON_BOOKED" });

  // Log activity
  await db.createActivity({
    organizationId: org.id,
    leadId: id,
    type: "BOOKING",
    title: `Unit ${unitNumber} Booked!`,
    description: `Deal closed for $${Number(agreedDealValue).toLocaleString()}. Token Advance: $${Number(tokenAmount || 0).toLocaleString()}.`,
  });

  return NextResponse.json({ success: true, booking });
}

