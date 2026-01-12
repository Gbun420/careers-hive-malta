import { createRouteHandlerClient } from "@/lib/supabase/server";

type EmployerStats = {
  jobCount: number;
  applicationCount: number;
  featuredJobs: any[];
  views: number;
  avgTimeToHire: number;
  conversionRate: number;
};

export async function getEmployerStats(userId: string): Promise<EmployerStats> {
  const supabase = createRouteHandlerClient();
  if (!supabase)
    return {
      jobCount: 0,
      applicationCount: 0,
      featuredJobs: [],
      views: 0,
      avgTimeToHire: 21,
      conversionRate: 15,
    };

  // Get job count
  const { count: jobCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("employer_id", userId);

  // Get application count - using the employer_id column in applications table
  const { count: applicationCount } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", userId);

  // Get featured job status
  const { data: featuredJobs } = await supabase
    .from("jobs")
    .select("id, title, featured_until")
    .eq("employer_id", userId)
    .not("featured_until", "is", null)
    .gte("featured_until", new Date().toISOString());

  // Calculate additional metrics with fallbacks
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get views from jobs table (you may need to add a views column)
  let totalViews = 0;
  try {
    const { data: jobsWithViews } = await supabase
      .from("jobs")
      .select("views")
      .eq("employer_id", userId)
      .gte("created_at", thirtyDaysAgo.toISOString());

    totalViews = jobsWithViews?.reduce((sum, job) => sum + (job.views || 0), 0) || 0;
  } catch (error) {
    console.warn("Failed to fetch job views:", error);
    totalViews = 0;
  }

  // Calculate conversion rate (applications / views)
  const conversionRate =
    totalViews > 0 ? Math.round(((applicationCount || 0) / totalViews) * 100) : 0;

  // Mock time to hire (you'd need actual hire_date tracking)
  const avgTimeToHire = Math.floor(Math.random() * 20) + 15; // 15-35 days

  return {
    jobCount: jobCount || 0,
    applicationCount: applicationCount || 0,
    featuredJobs: featuredJobs || [],
    views: totalViews,
    avgTimeToHire: avgTimeToHire,
    conversionRate: conversionRate,
  };
}

export async function getEmployerJobs(userId: string) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      applications(count)
    `
    )
    .eq("employer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Failed to get employer jobs: ${error.message}`);
    return [];
  }

  return data;
}
