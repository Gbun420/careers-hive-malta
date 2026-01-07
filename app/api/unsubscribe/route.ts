import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/alerts/tokens";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const result = verifyUnsubscribeToken(token);
  if (!result) {
    return new Response("Invalid or expired token", { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Server configuration error", { status: 500 });
  }

  const { error } = await supabase
    .from("job_alerts")
    .update({ enabled: false })
    .eq("id", result.alertId)
    .eq("user_id", result.userId);

  if (error) {
    return new Response("Failed to unsubscribe", { status: 500 });
  }

  trackEvent('alert_disabled' as any, { alert_id: result.alertId, method: 'unsubscribe_link' });

  // Return a simple HTML success page
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Unsubscribed</title>
        <style>
          body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
          .card { background: white; padding: 2rem; rounded: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; border-radius: 1.5rem; border: 1px solid #e2e8f0; }
          h1 { margin-top: 0; }
          p { color: #64748b; line-height: 1.5; }
          .btn { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #0d748c; color: white; text-decoration: none; border-radius: 9999px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Unsubscribed</h1>
          <p>You have been successfully unsubscribed from this job alert. You won't receive any more digest emails for this specific search.</p>
          <a href="/" class="btn">Back to Careers.mt</a>
        </div>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html" }
  });
}
