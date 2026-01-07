import { NextResponse } from "next/server";
import { fetchDynamicMetrics } from "@/lib/metrics";
import { jsonError } from "@/lib/api/errors";

export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers.get("x-internal-stats-token");
  const internalToken = process.env.INTERNAL_STATS_TOKEN;

  // Tightened security: Require valid token or fail with 401 JSON
  if (!internalToken || token !== internalToken) {
    return jsonError("UNAUTHORIZED", "Invalid stats token", 401);
  }

  try {
    const metrics = await fetchDynamicMetrics({
      queries: ['active_job_seekers', 'total_job_postings', 'verified_employers'],
      fallbacks: true
    });

    return NextResponse.json({
      totalJobs: metrics.total_job_postings.value,
      verifiedEmployers: metrics.verified_employers.value,
      activeJobseekers: metrics.active_job_seekers.value,
      lastUpdated: metrics.total_job_postings.lastUpdated
    });
  } catch (error) {
    console.error("Error in landing stats API:", error);
    return NextResponse.json({ 
        totalJobs: 0,
        verifiedEmployers: 0,
        activeJobseekers: 0
    });
  }
}