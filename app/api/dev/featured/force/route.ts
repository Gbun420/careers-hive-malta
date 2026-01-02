import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDevSecret } from "@/lib/dev/guard";
import { jsonError } from "@/lib/api/errors";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getFeaturedDurationDays } from "@/lib/billing/stripe";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import { upsertJobs } from "@/lib/search/meili";
import type { Job } from "@/lib/jobs/schema";

export const runtime = "nodejs";

const BodySchema = z.object({
  job_id: z.string().min(1, "Job is required."),
  days: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  const dev = requireDevSecret(request);
  if (!dev.ok) {
    return dev.response;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .eq("id", parsed.data.job_id)
    .maybeSingle();

  if (!job) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  const durationDays = parsed.data.days ?? getFeaturedDurationDays();
  const featuredUntil = new Date(
    Date.now() + durationDays * 24 * 60 * 60 * 1000
  ).toISOString();

  const { error: updateError } = await supabase.from("job_featured").upsert({
    job_id: parsed.data.job_id,
    featured_until: featuredUntil,
    featured_tier: 1,
    updated_at: new Date().toISOString(),
  });

  if (updateError) {
    return jsonError("DB_ERROR", updateError.message, 500);
  }

  try {
    const [withFeatured] = await attachFeaturedStatus([job as Job]);
    const [enriched] = await attachEmployerVerified([
      (withFeatured ?? job) as Job,
    ]);
    await upsertJobs([(enriched ?? withFeatured ?? job) as Job]);
  } catch (error) {
    // Best-effort indexing only.
  }

  return NextResponse.json({ job_id: parsed.data.job_id, featured_until: featuredUntil });
}
