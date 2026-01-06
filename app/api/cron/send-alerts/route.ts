import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { fetchMatchingJobs } from "@/lib/alerts/matcher";
import { sendDigestEmail } from "@/lib/email/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Supabase not configured", { status: 500 });
  }

  const { data: alerts, error } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sentCount = 0;

  for (const alert of alerts) {
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(alert.user_id);
    
    if (userError || !user || !user.email) {
        console.error(`Could not find user ${alert.user_id}`);
        continue;
    }

    const lastSent = alert.last_sent_at ? new Date(alert.last_sent_at) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const jobs = await fetchMatchingJobs(supabase, alert.query, alert.filters, lastSent);
    
    if (jobs.length > 0) {
        await sendDigestEmail({
            to: user.email,
            jobs: jobs,
            frequency: (alert.frequency || 'DAILY').toLowerCase() as "daily" | "weekly"
        });
        
        await supabase.from("job_alerts").update({ last_sent_at: new Date().toISOString() }).eq("id", alert.id);
        sentCount++;
    }
  }

  return NextResponse.json({ sent: sentCount });
}
