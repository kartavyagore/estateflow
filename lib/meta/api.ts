export interface MetaLeadData {
  id: string;
  created_time: string;
  name: string;
  phone: string;
  email?: string;
  rawFields: Record<string, string>;
}

export async function fetchMetaLeadDetails(
  leadgenId: string,
  pageAccessToken: string,
  graphApiVersion: string = "v22.0"
): Promise<MetaLeadData | null> {
  const url = `https://graph.facebook.com/${graphApiVersion}/${leadgenId}?access_token=${encodeURIComponent(
    pageAccessToken
  )}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Meta Graph API lead fetch failed for ${leadgenId}:`, errorText);
      return null;
    }

    const json = await response.json();
    const fieldData: Array<{ name: string; values: string[] }> = json.field_data || [];

    const rawFields: Record<string, string> = {};
    let name = "Meta Lead";
    let phone = "";
    let email = "";

    for (const field of fieldData) {
      const val = field.values?.[0] || "";
      rawFields[field.name] = val;

      const lowerName = field.name.toLowerCase();
      if (lowerName.includes("name") || lowerName.includes("full_name")) {
        name = val;
      } else if (lowerName.includes("phone") || lowerName.includes("phone_number")) {
        phone = val;
      } else if (lowerName.includes("email")) {
        email = val;
      }
    }

    return {
      id: json.id,
      created_time: json.created_time,
      name: name || "Meta Lead",
      phone: phone || "No Phone Provided",
      email: email || undefined,
      rawFields,
    };
  } catch (err) {
    console.error(`Meta Graph API request error:`, err);
    return null;
  }
}

