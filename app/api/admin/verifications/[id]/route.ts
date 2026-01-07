import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { jsonError } from "@/lib/api/errors";
import { VerificationUpdateSchema } from "@/lib/trust/schema";
import { logAudit } from "@/lib/audit/log";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { upsertJobs } from "@/lib/search/meili";
import type { Job } from "@/lib/jobs/schema";
import { attachFeaturedStatus } from "@/lib/billing/featured";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = VerificationUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data, error } = await auth.supabase
    .from("employer_verifications")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      reviewed_at: new Date().toISOString(),
      reviewer_id: auth.user.id,
    })
    .eq("id", id)
    .select("id, employer_id, status, notes, submitted_at, reviewed_at, reviewer_id")
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Verification request not found.", 404);
  }

  await logAudit({
    actorId: auth.user.id,
    action: `verification_${data.status}`,
    entityType: "employer_verification",
    entityId: data.id,
    meta: {
      employer_id: data.employer_id,
      status: data.status,
      notes: data.notes,
    },
  });

  const service = createServiceRoleClient();
  if (service) {
    const { data: jobs } = await service
      .from("jobs")
      .select(
        "id, employer_id, title, description, location, salary_range, created_at, is_active"
      )
      .eq("employer_id", data.employer_id);

    if (jobs && jobs.length > 0) {
      const verified = data.status === "approved";
      const withFeatured = await attachFeaturedStatus(jobs as Job[]);
      const enriched = withFeatured.map((job) => ({
        ...job,
        employer_verified: verified,
      })) as Job[];

      try {
        await upsertJobs(enriched);
      } catch (indexError) {
        // Best-effort indexing only.
      }
    }
  }

  return NextResponse.json({ data });
}
