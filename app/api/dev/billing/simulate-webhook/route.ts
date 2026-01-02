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

export const runtime = "nodejs";

const BodySchema = z.object({
  session_id: z.string().min(1, "Session ID is required."),
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

  return NextResponse.json({
    ok: true,
    fulfilled: true,
    job_id: result.jobId,
    featured_until: result.featuredUntil,
  });
}
