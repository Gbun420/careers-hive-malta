import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyUnsubscribeToken } from "@/lib/alerts/tokens";
import { absUrl } from "@/lib/site/url";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const payload = verifyUnsubscribeToken(token);
  if (!payload) {
    return new Response("Invalid or expired token", { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Server error", { status: 500 });
  }

  // Deactivate the alert
  const { error } = await supabase
    .from("job_alerts")
    .update({ enabled: false })
    .eq("id", payload.alertId)
    .eq("user_id", payload.userId);

  if (error) {
    console.error("Unsubscribe error:", error);
    return new Response("Failed to unsubscribe", { status: 500 });
  }

  // Return a simple HTML success page
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Unsubscribed - Careers.mt</title>
      <style>
        body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; }
        .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 400px; }
        h1 { color: #0f172a; margin-top: 0; }
        p { color: #64748b; line-height: 1.5; }
        .btn { display: inline-block; margin-top: 1.5rem; padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; text-decoration: none; border-radius: 0.5rem; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Unsubscribed</h1>
        <p>You have been successfully unsubscribed from this job alert. You can manage your other alerts in your dashboard.</p>
        <a href="${absUrl("/")}" class="btn">Back to Careers.mt</a>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}