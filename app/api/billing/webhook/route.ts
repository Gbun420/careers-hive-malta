import { NextResponse } from "next/server";
import Stripe from "stripe";
import { jsonError } from "@/lib/api/errors";
import {
  createStripeClient,
  getStripeWebhookSecret,
  isStripeWebhookConfigured,
} from "@/lib/billing/stripe";
import { fulfillFeaturedCheckoutSession } from "@/lib/billing/fulfillment";

export const runtime = "edge";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!isStripeWebhookConfigured()) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe webhook is not configured.",
      500
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonError("INVALID_INPUT", "Missing Stripe signature.", 400);
  }

  const stripe = createStripeClient();
  const secret = getStripeWebhookSecret();
  if (!stripe || !secret) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe webhook is not configured.",
      500
    );
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid Stripe signature.", 400);
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const result = await fulfillFeaturedCheckoutSession(session);
  if (!result.ok) {
    console.error(
      JSON.stringify({
        event: "webhook_fulfillment_failed",
        route: "/api/billing/webhook",
        request_id: requestId,
        error_code: result.error.code,
        message: result.error.message,
        session_id: session.id,
      })
    );
    return jsonError(
      result.error.code,
      result.error.message,
      result.error.status,
      result.error.details
    );
  }

  return NextResponse.json({ received: true, fulfilled: true });
}
