import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getRankedJobs } from "@/lib/jobs/matching";
import { JobseekerProfile } from "@/lib/jobs/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError || profile.role !== 'jobseeker') {
    return jsonError("NOT_FOUND", "Jobseeker profile not found.", 404);
  }

  // 2. Fetch Active Jobs
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .limit(100);

  if (jobsError) {
    return jsonError("DB_ERROR", jobsError.message, 500);
  }

  // 3. Rank Jobs
  const rankedJobs = getRankedJobs(profile as JobseekerProfile, jobs || []);

  return NextResponse.json({
    data: rankedJobs.slice(0, 10).map(j => ({
      ...j,
      matchScore: j.matchResult.score,
      matchReasons: j.matchResult.reasons
    })),
  });
}