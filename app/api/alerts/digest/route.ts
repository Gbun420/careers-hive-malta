import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { isEmailConfigured, sendDigestEmail } from "@/lib/email/sender";
import { matchJobToSearch } from "@/lib/alerts/match";
import { SavedSearchCriteriaSchema } from "@/lib/alerts/criteria";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const dispatchSecret = process.env.ALERT_DISPATCH_SECRET;

export async function POST(request: Request) {
  const providedSecret = request.headers.get("x-alert-dispatch-secret");
  if (!dispatchSecret || providedSecret !== dispatchSecret) {
    return jsonError("FORBIDDEN", "Invalid dispatch secret.", 403);
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  if (!isEmailConfigured()) {
    return jsonError(
      "EMAIL_NOT_CONFIGURED",
      "Email provider is not configured.",
      500
    );
  }

  let body: { frequency?: "daily" | "weekly" } = {};
  try {
    body = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  if (body.frequency !== "daily" && body.frequency !== "weekly") {
    return jsonError("INVALID_INPUT", "Invalid frequency.", 400);
  }

  const since = new Date();
  since.setDate(since.getDate() - (body.frequency === "daily" ? 1 : 7));

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .eq("is_active", true)
    .gte("created_at", since.toISOString());

  if (jobsError) {
    return jsonError("DB_ERROR", jobsError.message, 500);
  }

  const { data: searches, error: searchError } = await supabase
    .from("saved_searches")
    .select("id, jobseeker_id, frequency, search_criteria")
    .eq("frequency", body.frequency);

  if (searchError) {
    return jsonError("DB_ERROR", searchError.message, 500);
  }

  const jobsList = jobs ?? [];
  const matchesByUser = new Map<string, typeof jobsList>();

  for (const search of searches ?? []) {
    const criteriaResult = SavedSearchCriteriaSchema.safeParse(
      search.search_criteria
    );
    if (!criteriaResult.success) {
      continue;
    }

    const matchedJobs = jobsList.filter((job) =>
      matchJobToSearch(job, criteriaResult.data).match
    );

    if (matchedJobs.length === 0) {
      continue;
    }

    const existing = matchesByUser.get(search.jobseeker_id as string) ?? [];
    const merged = [...existing, ...matchedJobs];
    matchesByUser.set(search.jobseeker_id as string, merged);
  }

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const [userId, matchedJobs] of matchesByUser.entries()) {
    processed += 1;

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(userId);

    if (userError || !userData.user?.email) {
      failed += 1;
      continue;
    }

    const result = await sendDigestEmail({
      to: userData.user.email,
      jobs: matchedJobs,
      frequency: body.frequency,
    });

    if (!result.ok) {
      failed += 1;
      continue;
    }

    sent += 1;
  }

  return NextResponse.json({ processed, sent, failed });
}
