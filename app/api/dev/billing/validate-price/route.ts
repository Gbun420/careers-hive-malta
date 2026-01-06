import { NextResponse } from "next/server";
import { requireDevSecret } from "@/lib/dev/guard";
import { jsonError } from "@/lib/api/errors";
import {
  createStripeClient,
  getStripeFeaturedPriceId,
  isStripeConfigured,
  mapStripeError,
} from "@/lib/billing/stripe";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const stripe = createStripeClient();
  const priceId = getStripeFeaturedPriceId();
  if (!stripe || !priceId) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured.",
      503
    );
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    return NextResponse.json({
      valid: true,
      priceId: price.id,
      currency: price.currency,
      unit_amount: price.unit_amount,
      product: price.product,
      livemode: price.livemode,
    });
  } catch (error) {
    const mapped = mapStripeError(error);
    return jsonError(mapped.code, mapped.message, mapped.status, mapped.details);
  }
}
