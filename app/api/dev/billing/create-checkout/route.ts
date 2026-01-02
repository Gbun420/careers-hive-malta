import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDevSecret } from "@/lib/dev/guard";
import { jsonError } from "@/lib/api/errors";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createFeaturedCheckoutSession } from "@/lib/billing/checkout";
import { isStripeConfigured } from "@/lib/billing/stripe";

export const runtime = "nodejs";

const BodySchema = z.object({
  job_id: z.string().min(1, "Job is required."),
});

export async function POST(request: Request) {
  const dev = requireDevSecret(request);
  if (!dev.ok) {
    return dev.response;
  }

  if (!isStripeConfigured()) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured.",
      503
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const service = createServiceRoleClient();
  if (!service) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: job, error: jobError } = await service
    .from("jobs")
    .select("id, employer_id")
    .eq("id", parsed.data.job_id)
    .maybeSingle();

  if (jobError || !job) {
    return jsonError("JOB_NOT_FOUND", "Job not found.", 404);
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const result = await createFeaturedCheckoutSession({
    employerId: job.employer_id,
    jobId: job.id,
    customerEmail: null,
    origin,
    allowDbFailure: true,
  });

  if ("error" in result) {
    return jsonError(
      result.error.code,
      result.error.message,
      result.error.status,
      result.error.details
    );
  }

  return NextResponse.json({
    url: result.url,
    session_id: result.sessionId,
    dbRecorded: result.dbRecorded,
    ...(result.dbError
      ? { dbError: { code: result.dbError.code, message: result.dbError.message, details: result.dbError.details } }
      : {}),
  });
}
