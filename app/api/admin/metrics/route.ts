import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";
import { subDays, startOfDay, formatISO } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  try {
    const fourteenDaysAgo = formatISO(startOfDay(subDays(new Date(), 14)));

    const [
      { count: activeJobs },
      { count: pendingVerifications },
      { count: openReports },
      { count: totalUsers },
      { data: jobTrend },
      { data: userTrend }
    ] = await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employer"),
      supabase.from("job_reports").select("*", { count: "exact", head: true }).in("status", ["new", "reviewing"]),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      // Fetch trend data
      supabase.from("jobs")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo)
        .order("created_at", { ascending: true }),
      supabase.from("profiles")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo)
        .order("created_at", { ascending: true })
    ]);

    // Simple daily grouping for trend lines
    const processTrend = (data: any[] | null) => {
      if (!data) return [];
      const counts: Record<string, number> = {};
      data.forEach(item => {
        const date = item.created_at.split("T")[0];
        counts[date] = (counts[date] || 0) + 1;
      });
      return Object.entries(counts).map(([date, count]) => ({ date, count }));
    };

    return NextResponse.json({
      data: {
        active_jobs: activeJobs || 0,
        pending_employer_verifications: pendingVerifications || 0,
        open_reports: openReports || 0,
        total_users: totalUsers || 0,
        trends: {
          jobs: processTrend(jobTrend),
          users: processTrend(userTrend)
        }
      }
    });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}
