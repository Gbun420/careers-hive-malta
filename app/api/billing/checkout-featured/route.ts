import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import {
  isStripeConfigured,
} from "@/lib/billing/stripe";
import { createFeaturedCheckoutSession } from "@/lib/billing/checkout";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "edge";

const BodySchema = z.object({
  job_id: z.string().min(1, "Job is required."),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!isStripeConfigured()) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured.",
      503
    );
  }

  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "employer") {
    return jsonError("FORBIDDEN", "Employer access required.", 403);
  }

  const rateKey = buildRateLimitKey(
    request,
    "billing-checkout",
    authData.user.id
  );
  const limit = await rateLimit(rateKey, { windowMs: 60 * 60_000, max: 10 });
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      "Too many requests. Try again later.",
      429,
      { resetAt: limit.resetAt }
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

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, employer_id, title")
    .eq("id", parsed.data.job_id)
    .eq("employer_id", authData.user.id)
    .maybeSingle();

  if (jobError || !job) {
    return jsonError("JOB_NOT_FOUND", "Job not found.", 404);
  }

  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const result = await createFeaturedCheckoutSession({
    employerId: authData.user.id,
    jobId: job.id,
    customerEmail: authData.user.email ?? null,
    origin,
  });

  if ("error" in result) {
    console.error(
      JSON.stringify({
        event: "checkout_failed",
        route: "/api/billing/checkout-featured",
        request_id: requestId,
        user_id: authData.user.id,
        error_code: result.error.code,
        message: result.error.message,
      })
    );
    return jsonError(
      result.error.code,
      result.error.message,
      result.error.status,
      result.error.details
    );
  }

  return NextResponse.json({ url: result.url });
}
