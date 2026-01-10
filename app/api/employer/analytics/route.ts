import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceRoleClient();
  
  if (!supabase) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
  
  // Get current user (employer)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get Active Jobs Count
  const { count: activeJobs } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("employer_id", user.id)
    .eq("is_active", true);

  // 2. Get Total Views & Applications (from jobs table counters)
  const { data: jobsStats } = await supabase
    .from("jobs")
    .select("views_count, application_count")
    .eq("employer_id", user.id);

  const totalViews = jobsStats?.reduce((sum, job) => sum + (job.views_count || 0), 0) || 0;
  const totalApps = jobsStats?.reduce((sum, job) => sum + (job.application_count || 0), 0) || 0;
  
  // 3. Calculate Conversion Rate
  const conversionRate = totalViews > 0 
    ? ((totalApps / totalViews) * 100).toFixed(1) + "%" 
    : "0%";

  // 4. Get 30-day Trend (from job_daily_metrics)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: trendData } = await supabase
    .from("job_daily_metrics")
    .select("date, views_count, applications_count")
    .in("job_id", (
        // Subquery workaround: fetch job IDs first or join. 
        // Supabase select with filtering on related table is easier if we had the relation set up in Types.
        // Let's do a join query or filter by job_id list.
        // Getting job IDs first is safer for RLS/simplicity.
        [] 
    ))
    .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);
    
  // Actually, RLS on job_daily_metrics already filters by auth.uid() owner (via policy).
  // So we can just query job_daily_metrics directly?
  // Wait, the policy "Employer read own metrics" checks `EXISTS (SELECT 1 FROM jobs WHERE employer_id = auth.uid())`.
  // So yes, `select * from job_daily_metrics` will only return their rows.
  
  const { data: dailyMetrics } = await supabase
    .from("job_daily_metrics")
    .select("views_count, applications_count")
    .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);

  const views30d = dailyMetrics?.reduce((sum, m) => sum + (m.views_count || 0), 0) || 0;
  const apps30d = dailyMetrics?.reduce((sum, m) => sum + (m.applications_count || 0), 0) || 0;

  // 5. Verification Status
  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    kpis: {
      active_postings: activeJobs || 0,
      total_views_30d: views30d, // Or totalViews if we want lifetime
      total_applications: totalApps, // Lifetime
      conversion_rate: conversionRate
    },
    verification_status: profile?.verification_status || 'pending'
  });
}
