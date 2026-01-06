import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import type { Job } from "@/lib/jobs/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ data: [] });
  }

  // Fetch jobs that are currently featured
  const nowIso = new Date().toISOString();
  const { data: featuredIds } = await supabase
    .from("job_featured")
    .select("job_id")
    .gt("featured_until", nowIso)
    .limit(10);

  if (!featuredIds || featuredIds.length === 0) {
    // Fallback: Show latest active jobs if none are featured
    const { data: latestJobs } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6);
    
    const withFeatured = await attachFeaturedStatus(latestJobs as Job[] || []);
    const enriched = await attachEmployerVerified(withFeatured);
    return NextResponse.json({ data: enriched });
  }

  const ids = featuredIds.map(f => f.job_id);
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .in("id", ids)
    .eq("is_active", true);

  const withFeatured = await attachFeaturedStatus(jobs as Job[] || []);
  const enriched = await attachEmployerVerified(withFeatured);

  return NextResponse.json({ data: enriched });
}
