import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api/errors";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  getStripeFeaturedPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export const runtime = "edge";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return jsonError("NOT_FOUND", "Not found.", 404);
  }

  return NextResponse.json({
    billingConfigured: isStripeConfigured(),
    hasSecretKey: Boolean(process.env.STRIPE_SECRET_KEY),
    hasFeaturedPriceId: Boolean(process.env.STRIPE_FEATURED_PRICE_ID),
    featuredDurationDays: getFeaturedDurationDays(),
    priceLabel: getFeaturedPriceLabel(),
    featuredPriceId: getStripeFeaturedPriceId(),
    featuredPriceValid: null,
  });
}
