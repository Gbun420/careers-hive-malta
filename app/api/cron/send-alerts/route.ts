import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { fetchMatchingJobs } from "@/lib/alerts/matcher";
import { sendDigestEmail } from "@/lib/email/sender";
import { generateUnsubscribeToken } from "@/lib/alerts/tokens";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("x-cron-secret");
  if (authHeader !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Supabase not configured", { status: 500 });
  }

  // 1. Fetch enabled alerts
  const { data: alerts, error } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sentCount = 0;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";

  for (const alert of alerts) {
    // Check frequency (simplified: this cron runs daily)
    // In a real app, we'd check if weekly alerts should run today
    if (alert.frequency === "WEEKLY") {
        // Only run weekly alerts on Mondays?
        const isMonday = new Date().getDay() === 1;
        if (!isMonday) continue;
    }

    // Window: since last_sent_at else last 24h
    const lastSent = alert.last_sent_at ? new Date(alert.last_sent_at) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const jobs = await fetchMatchingJobs(supabase, alert.query, alert.filters, lastSent);
    
    if (jobs.length > 0) {
        // Fetch user email (admin client can access auth.users via specific query or admin.getUserById)
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
                    unsubscribe_token_hash: token // We store the current token for easy lookup if needed
                })
                .eq("id", alert.id);
            
            trackEvent('alert_digest_sent' as any, { alert_id: alert.id, job_count: jobs.length });
            sentCount++;
        }
    }
  }

  return NextResponse.json({ sent: sentCount, timestamp: new Date().toISOString() });
}