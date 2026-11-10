import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");
  if (!orgSlug) return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const branding = await db.getBranding(org.id);
  return NextResponse.json({ branding, orgName: org.name, orgSlug: org.slug });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgSlug, ...brandingUpdates } = body;

    if (!orgSlug) return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });

    const org = await db.findOrganizationBySlug(orgSlug);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const updated = await db.upsertBranding(org.id, brandingUpdates);
    return NextResponse.json({ success: true, branding: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

