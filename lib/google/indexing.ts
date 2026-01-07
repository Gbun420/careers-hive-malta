import "server-only";
import { JWT } from "google-auth-library";
import { trackEvent } from "@/lib/analytics";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type IndexingNotificationType = "URL_UPDATED" | "URL_DELETED";

const GOOGLE_INDEXING_ENABLED = process.env.GOOGLE_INDEXING_ENABLED === "true";
const CLIENT_EMAIL = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_INDEXING_PRIVATE_KEY;
const SITE_URL = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";

/**
 * Publishes a URL notification to the Google Indexing API.
 * This is restricted to pages containing JobPosting structured data.
 */
export async function publishIndexingNotification(
  url: string,
  type: IndexingNotificationType,
  jobId?: string
) {
  if (!GOOGLE_INDEXING_ENABLED) return;

  // 1. Validate URL
  try {
    const parsedUrl = new URL(url);
    const siteHost = new URL(SITE_URL).host;
    if (parsedUrl.host !== siteHost) {
      console.warn(`[Indexing] Skipping URL with mismatched host: ${url} (expected ${siteHost})`);
      return;
    }
  } catch (e) {
    console.error(`[Indexing] Invalid URL provided: ${url}`);
    return;
  }

  if (!CLIENT_EMAIL || !PRIVATE_KEY) {
    console.warn("[Indexing] Missing Google Indexing credentials.");
    return;
  }

  // 2. Idempotency Check (Don't spam Google for same URL/type/day)
  const supabase = createServiceRoleClient();
  if (supabase) {
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("google_indexing_events")
      .select("id")
      .eq("url", url)
      .eq("type", type)
      .gte("created_at", today)
      .maybeSingle();

    if (existing) {
      console.log(`[Indexing] Skipping duplicate notification for ${url} today.`);
      return;
    }
  }

  // 3. Simple Rate Limiting (150/day limit)
  if (supabase) {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("google_indexing_events")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    if ((count || 0) >= 150) {
      console.warn("[Indexing] Daily quota of 150 reached. Skipping.");
      trackEvent("indexing_failed" as any, { url, type, error: "QUOTA_EXCEEDED" });
      return;
    }
  }

  // 4. Fire-and-forget generation
  // We use a self-invoking async function to not block the main flow
  (async () => {
    try {
      const client = new JWT({
        email: CLIENT_EMAIL,
        key: PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/indexing"],
      });

      const response = await client.request({
        url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
        method: "POST",
        data: {
          url: url,
          type: type,
        },
      });

      if (response.status === 200) {
        if (supabase) {
          await supabase.from("google_indexing_events").insert({
            url,
            type,
            job_id: jobId,
          });
        }
        trackEvent("indexing_submitted" as any, { url, type });
        console.log(`[Indexing] Successfully notified Google of ${type} for ${url}`);
      } else {
        throw new Error(`Google Indexing API returned ${response.status}`);
      }
    } catch (error: any) {
      console.error("[Indexing] Failed to notify Google:", error.message);
      trackEvent("indexing_failed" as any, { url, type, error: error.message });
    }
  })();
}
