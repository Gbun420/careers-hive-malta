import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDevSecret } from "@/lib/dev/guard";
import { jsonError } from "@/lib/api/errors";
import {
  createStripeClient,
  isStripeConfigured,
  mapStripeError,
} from "@/lib/billing/stripe";
import { fulfillFeaturedCheckoutSession } from "@/lib/billing/fulfillment";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  session_id: z.string().min(1, "Session ID is required."),
});

export async function POST(request: Request) {
  const dev = requireDevSecret(request);
  if (!dev.ok) {
    return dev.response;
  }

  const rateKey = buildRateLimitKey(request, "dev:simulate-webhook");
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
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const stripe = createStripeClient();
  if (!stripe) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured.",
      503
    );
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(parsed.data.session_id);
  } catch (error) {
    const mapped = mapStripeError(error);
    return jsonError(mapped.code, mapped.message, mapped.status, mapped.details);
  }

  const result = await fulfillFeaturedCheckoutSession(session);
  if (!result.ok) {
    return jsonError(
      result.error.code,
      result.error.message,
      result.error.status,
      result.error.details
    );
  }

  const service = createServiceRoleClient();
  let auditEntry: { id?: string; created_at?: string } | null = null;
  if (service) {
    const { data: audit } = await service
      .from("audit_logs")
      .select("id, created_at")
      .eq("action", "featured_purchased")
      .eq("entity_id", result.jobId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    auditEntry = audit ?? null;
  }

  return NextResponse.json({
    ok: true,
    fulfilled: true,
    job_id: result.jobId,
    featured_until: result.featuredUntil,
    audit: auditEntry,
  });
}
