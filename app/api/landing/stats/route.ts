import { NextResponse } from "next/server";
import { fetchDynamicMetrics } from "@/lib/metrics";

export const runtime = "nodejs"; 
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers.get("X-INTERNAL-STATS-TOKEN");
  const internalToken = process.env.INTERNAL_STATS_TOKEN;

  // Protect the endpoint: only allow access if the token matches or if we're not in production
  // Actually, instructions say: require header matching env; otherwise return 404.
  if (!internalToken || token !== internalToken) {
    return new NextResponse(null, { status: 404 });
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
