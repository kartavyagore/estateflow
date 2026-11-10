import crypto from "crypto";
import { verifyMetaWebhookSignature } from "../lib/meta/webhook";

export async function testMetaWebhooks() {
  console.log("▶ Testing Meta Webhook HMAC Verification & Security...");

  const payload = JSON.stringify({
    object: "page",
    entry: [
      {
        id: "page_12345",
        time: 1730000000,
        changes: [{ field: "leadgen", value: { leadgen_id: "lead_999", form_id: "form_111" } }],
      },
    ],
  });

  const secret = "meta_test_secret_key_888";

  // 1. Generate valid HMAC SHA-256
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload, "utf8");
  const validSignature = `sha256=${hmac.digest("hex")}`;

  const isValid = verifyMetaWebhookSignature(payload, validSignature, secret);
  if (!isValid) throw new Error("Valid Meta HMAC SHA-256 signature was rejected!");

  // 2. Reject tampered payload
  const tamperedPayload = payload + " ";
  const isTamperedValid = verifyMetaWebhookSignature(tamperedPayload, validSignature, secret);
  if (isTamperedValid) throw new Error("Tampered webhook body was accepted!");

  // 3. Reject wrong secret
  const isWrongSecretValid = verifyMetaWebhookSignature(payload, validSignature, "wrong_secret");
  if (isWrongSecretValid) throw new Error("Invalid app secret was accepted!");

  console.log("  ✔ Meta Webhook HMAC SHA-256 verification passed");
  console.log("  ✔ Tampered webhook payload rejection passed");
}

