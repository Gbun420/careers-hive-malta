import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDevSecret } from "@/lib/dev/guard";
import { jsonError } from "@/lib/api/errors";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { createFeaturedCheckoutSession } from "@/lib/billing/checkout";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";
import { SITE_URL } from "@/lib/site/url";


const BodySchema = z.object({
  job_id: z.string().min(1, "Job is required."),
  employer_id: z.string().optional(),
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const dev = requireDevSecret(request);
  if (!dev.ok) {
    return dev.response;
  }

  const rateKey = buildRateLimitKey(request, "dev:stripe-session");
  const limit = await rateLimit(rateKey, { windowMs: 60_000, max: 30 });
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      "Too many requests. Try again later.",
      429,
      { resetAt: limit.resetAt }
    );
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
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const jobId = parsed.data.job_id;
  let employerId: string | null = null;
  let customerEmail: string | null = null;

  const supabase = createRouteHandlerClient();
  if (supabase) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user) {
      const role = getUserRole(authData.user);
      if (role !== "employer") {
        return jsonError("FORBIDDEN", "Employer access required.", 403);
      }

      const { data: job } = await supabase
        .from("jobs")
        .select("id, employer_id")
        .eq("id", jobId)
        .eq("employer_id", authData.user.id)
        .maybeSingle();

      if (!job) {
        return jsonError("NOT_FOUND", "Job not found.", 404);
      }

      employerId = authData.user.id;
      customerEmail = authData.user.email ?? null;
    }
  }

  if (!employerId) {
    if (!parsed.data.employer_id) {
      return jsonError(
        "INVALID_INPUT",
        "Employer ID required when unauthenticated.",
        400
      );
    }

    const service = createServiceRoleClient();
    if (!service) {
      return jsonError(
        "SUPABASE_NOT_CONFIGURED",
        "Supabase is not configured.",
        503
      );
    }

    const { data: job } = await service
      .from("jobs")
      .select("id, employer_id")
      .eq("id", jobId)
      .eq("employer_id", parsed.data.employer_id)
      .maybeSingle();

    if (!job) {
      return jsonError("NOT_FOUND", "Job not found.", 404);
    }

    employerId = parsed.data.employer_id;
  }

  const origin =
    request.headers.get("origin") ?? SITE_URL;

  const result = await createFeaturedCheckoutSession({
    employerId,
    jobId,
    customerEmail,
    origin,
  });

  if ("error" in result) {
    return jsonError(result.error.code, result.error.message, result.error.status);
  }

  return NextResponse.json({ url: result.url, session_id: result.sessionId });
}
