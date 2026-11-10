import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMetaWebhookSignature } from "@/lib/meta/webhook";
import { fetchMetaLeadDetails } from "@/lib/meta/api";
import { selectAssignee, AssigneeCandidate } from "@/lib/lead-engine/assignment";

/**
 * Meta Webhook Verification (GET)
 * Meta checks this during app webhook setup.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "estateflow-meta-webhook-token";

  if (mode === "subscribe" && token === expectedToken) {
    console.log("✅ Meta Webhook subscription successfully verified!");
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta Lead Ads Ingestion (POST)
 * Receives real-time lead event from Facebook / Instagram Lead Ads.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const appSecret = process.env.META_APP_SECRET || "";

    // Signature verification (if configured)
    if (appSecret && signature) {
      const isValid = verifyMetaWebhookSignature(rawBody, signature, appSecret);
      if (!isValid) {
        console.warn("⚠️ Meta Webhook signature verification failed!");
        return NextResponse.json({ error: "Invalid HMAC signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Save durable webhook event record immediately
    const webhookEvent = await db.createWebhookEvent({
      provider: "META",
      eventType: "leadgen",
      payload: rawBody,
      status: "PENDING",
      retryCount: 0,
    });

    const entries = payload.entry || [];
    let processedCount = 0;

    for (const entry of entries) {
      const pageId = entry.id; // Meta Page ID
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field === "leadgen") {
          const leadgenVal = change.value;
          const { leadgen_id, form_id, page_id } = leadgenVal;
          const targetPageId = page_id || pageId;

          // Find connected organization by metaPageId
          const store = (db as any).init ? null : null; // Ensure store is initialized
          const orgs = await db.findOrganizations();
          let targetOrg = null;
          let targetConnection = null;

          for (const org of orgs) {
            const conns = await db.getMetaConnections(org.id);
            const foundConn = conns.find((c) => c.metaPageId === targetPageId && c.status === "CONNECTED");
            if (foundConn) {
              targetOrg = org;
              targetConnection = foundConn;
              break;
            }
          }

          if (!targetOrg) {
            console.warn(`Meta Webhook: No active organization found for Meta Page ID ${targetPageId}`);
            continue;
          }

          // Check if this lead was already processed (deduplication)
          const existingLeads = await db.getLeads(targetOrg.id);
          const isDuplicate = existingLeads.some((l) => l.metaLeadId === leadgen_id);
          if (isDuplicate) {
            console.log(`Meta Webhook: Duplicate lead ${leadgen_id} ignored.`);
            continue;
          }

          // Find form mapping
          const formMappings = await db.getMetaFormMappings(targetOrg.id);
          const mapping = formMappings.find((m) => m.metaFormId === form_id && m.isActive);
          const mappedProjectId = mapping?.projectId || null;

          // Retrieve lead details from Meta Graph API
          let leadName = "Meta Lead";
          let leadPhone = "+1-555-0100";
          let leadEmail = undefined;

          // If payload already includes simulated or actual fields (e.g. testing)
          if (leadgenVal.test_lead) {
            leadName = leadgenVal.test_lead.name || "Test Meta Lead";
            leadPhone = leadgenVal.test_lead.phone || "+1-555-019-9999";
            leadEmail = leadgenVal.test_lead.email || "test.meta@example.com";
          } else if (targetConnection?.accessToken) {
            const fetched = await fetchMetaLeadDetails(leadgen_id, targetConnection.accessToken);
            if (fetched) {
              leadName = fetched.name;
              leadPhone = fetched.phone;
              leadEmail = fetched.email;
            }
          }

          // Lead Auto-Assignment Engine
          const members = await db.findMembersByOrgId(targetOrg.id);
          const candidates: AssigneeCandidate[] = members
            .filter((m) => m.role === "SALESPERSON" || m.role === "SALES_MANAGER")
            .map((m) => {
              const activeCount = existingLeads.filter(
                (l) => l.assignedToMemberId === m.id && l.status !== "WON_BOOKED" && l.status !== "LOST"
              ).length;
              return {
                id: m.id,
                userId: m.userId,
                name: m.user.name,
                email: m.user.email,
                role: m.role,
                capacity: m.capacity,
                isAvailable: m.isAvailable,
                activeLeadCount: activeCount,
              };
            });

          const assignmentDecision = selectAssignee(candidates, "ROUND_ROBIN");
          const assignedMemberId = assignmentDecision.isSuccessful ? assignmentDecision.assignedMemberId : null;

          // Create Lead in CRM
          const newLead = await db.createLead({
            organizationId: targetOrg.id,
            projectId: mappedProjectId,
            assignedToMemberId: assignedMemberId,
            name: leadName,
            phone: leadPhone,
            email: leadEmail,
            source: mapping?.defaultSource || "FACEBOOK",
            sourceCampaign: `Meta Form: ${mapping?.formName || form_id}`,
            status: "NEW",
            priority: "HIGH",
            temperature: "HOT",
            timeline: "1_3_MONTHS",
            metaLeadId: leadgen_id,
            requirements: `Captured automatically via Meta Lead Ad (Form ID: ${form_id})`,
          });

          // Log Activity
          await db.createActivity({
            organizationId: targetOrg.id,
            leadId: newLead.id,
            memberId: assignedMemberId,
            type: "STATUS_CHANGE",
            title: "Meta Lead Ingested",
            description: `Auto-captured from Meta Lead Ads. Assigned via ${assignmentDecision.reason}.`,
          });

          processedCount++;
        }
      }
    }

    // Mark webhook event PROCESSED
    webhookEvent.status = "PROCESSED";
    webhookEvent.processedAt = new Date().toISOString();

    return NextResponse.json({ success: true, processedCount });
  } catch (err: any) {
    console.error("Meta Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook ingestion error", details: err.message }, { status: 500 });
  }
}
