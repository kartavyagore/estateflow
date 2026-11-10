import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");
  if (!orgSlug) return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const projects = await db.getProjects(org.id);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgSlug, name, code, description, location, propertyType, unitCategories, priceMin, priceMax } = body;

    if (!orgSlug || !name || !location) {
      return NextResponse.json({ error: "Name and location are required" }, { status: 400 });
    }

    const org = await db.findOrganizationBySlug(orgSlug);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const project = await db.createProject({
      organizationId: org.id,
      name,
      code: code || null,
      description: description || null,
      location,
      propertyType: propertyType || "APARTMENT",
      unitCategories: unitCategories || null,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
      status: "ACTIVE",
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

