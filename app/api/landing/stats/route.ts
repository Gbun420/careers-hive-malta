import { NextResponse } from "next/server";
import { fetchDynamicMetrics } from "@/lib/metrics";
import { publicMetricsEnabled } from "@/lib/flags";

export const runtime = "nodejs"; // fetchDynamicMetrics uses unstable_cache which might prefer nodejs in some envs
export const dynamic = "force-dynamic";

export async function GET() {
  if (!publicMetricsEnabled) {
    return NextResponse.json({
      totalJobs: "Live Feed",
      verifiedEmployers: "Active",
      activeJobseekers: "Verified",
    });
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