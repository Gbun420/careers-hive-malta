import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { fetchMatchingJobs } from "@/lib/alerts/matcher";
import { sendDigestEmail } from "@/lib/email/sender";
import { generateUnsubscribeToken } from "@/lib/alerts/tokens";
import { trackEvent } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Secret Validation
  const authHeader = request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || authHeader !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Kill Switch Check
  if (process.env.CRON_ENABLED !== "true") {
    trackEvent('cron_skipped' as any, { job: 'alerts_dispatch', reason: 'disabled' });
    return new NextResponse(null, { status: 204 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Supabase not configured", { status: 500 });
  }

  const startTime = Date.now();

  try {
    // 1. Fetch enabled alerts
    const { data: alerts, error } = await supabase
      .from("job_alerts")
      .select("*")
      .eq("enabled", true);

    if (error) {
      throw error;
    }

    let sentCount = 0;
    const baseUrl = SITE_URL;

    for (const alert of alerts) {
      // Check frequency (daily cron)
      if (alert.frequency === "WEEKLY") {
          const isMonday = new Date().getDay() === 1;
          if (!isMonday) continue;
      }

      const lastSent = alert.last_sent_at ? new Date(alert.last_sent_at) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const jobs = await fetchMatchingJobs(supabase, alert.query, alert.filters, lastSent);
      
      if (jobs.length > 0) {
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(alert.user_id);
          
          if (userError || !user || !user.email) {
              console.error(`Could not find user ${alert.user_id}`);
              continue;
          }

          const token = generateUnsubscribeToken(user.id, alert.id);
          const unsubscribeUrl = `${baseUrl}/api/unsubscribe?token=${token}`;

          const result = await sendDigestEmail({
              to: user.email,
              jobs: jobs as any,
              frequency: alert.frequency.toLowerCase() as "daily" | "weekly",
              unsubscribeUrl
          });

          if (result.ok) {
              await supabase
                  .from("job_alerts")
                  .update({ 
                      last_sent_at: new Date().toISOString(),
                      unsubscribe_token_hash: token
                  })
                  .eq("id", alert.id);
              
              trackEvent('alert_digest_sent' as any, { alert_id: alert.id, job_count: jobs.length });
              sentCount++;
          }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Cron: Alerts dispatch complete. Sent: ${sentCount}. Duration: ${duration}ms`);
    
    trackEvent('cron_alerts_done' as any, { 
      sent_count: sentCount, 
      duration_ms: duration 
    });

    return NextResponse.json({ 
      ok: true, 
      sent: sentCount, 
      duration_ms: duration,
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    console.error("Cron: Alerts dispatch failed:", err);
    trackEvent('cron_failed' as any, { 
      job: 'alerts_dispatch',
      error: err.message 
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Keep GET for manual verification if secret is provided in URL or header
export async function GET(request: NextRequest) {
  return POST(request);
}