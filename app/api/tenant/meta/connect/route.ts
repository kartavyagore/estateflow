import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orgSlug = searchParams.get("orgSlug");
  if (!orgSlug) return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });

  const org = await db.findOrganizationBySlug(orgSlug);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const connections = await db.getMetaConnections(org.id);
  const formMappings = await db.getMetaFormMappings(org.id);
  const projects = await db.getProjects(org.id);

  return NextResponse.json({ connections, formMappings, projects });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgSlug, metaPageId, pageName, accessToken, metaFormId, formName, projectId } = body;

    if (!orgSlug || !metaPageId || !pageName) {
      return NextResponse.json({ error: "Missing required Meta connection parameters" }, { status: 400 });
    }

    const org = await db.findOrganizationBySlug(orgSlug);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const connection = await db.upsertMetaConnection(org.id, {
      metaPageId,
      pageName,
      accessToken: accessToken || "EAAB..." + Math.random().toString(36).substring(2, 10),
    });

    let mapping = null;
    if (metaFormId && formName) {
      mapping = await db.createMetaFormMapping({
        organizationId: org.id,
        connectionId: connection.id,
        metaFormId,
        formName,
        projectId: projectId || null,
        defaultSource: "FACEBOOK",
        isActive: true,
      });
    }

    return NextResponse.json({ success: true, connection, mapping });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

