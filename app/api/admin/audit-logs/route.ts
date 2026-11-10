import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin } from "@/lib/permissions/rbac";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!canAccessAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const logs = await db.getAuditLogs();
  return NextResponse.json({ logs });
}

