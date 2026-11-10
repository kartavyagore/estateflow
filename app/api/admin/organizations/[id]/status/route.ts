import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/rbac";
import { db } from "@/lib/db";
import { OrgStatus } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!canAccessAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const validStatuses: OrgStatus[] = ["ACTIVE", "PENDING", "SUSPENDED", "ARCHIVED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db.updateOrganization(id, { status });
  if (!updated) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  await db.logAudit({
    organizationId: id,
    userId: session?.userId,
    action: `ORGANIZATION_STATUS_CHANGED_${status}`,
    resourceType: "ORGANIZATION",
    resourceId: id,
    details: { newStatus: status },
  });

  return NextResponse.json({ success: true, organization: updated });
}

