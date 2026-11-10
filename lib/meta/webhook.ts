import crypto from "crypto";

export interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string; // Page ID
    time: number;
    changes: Array<{
      field: string; // "leadgen"
      value: {
        ad_id?: string;
        form_id: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
        adgroup_id?: string;
      };
    }>;
  }>;
}

export function verifyMetaWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") return false;

  const expectedSignature = parts[1];
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(rawBody, "utf8");
  const calculatedSignature = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(calculatedSignature, "hex")
    );
  } catch {
    return false;
  }
}

