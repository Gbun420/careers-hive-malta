import "server-only";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const featuredPriceId = process.env.STRIPE_FEATURED_PRICE_ID;
const featuredPriceLabel =
  process.env.FEATURED_PRICE_LABEL ?? process.env.STRIPE_FEATURED_PRICE_LABEL;

export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey && featuredPriceId);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(stripeSecretKey && stripeWebhookSecret);
}

export function getStripeWebhookSecret(): string | null {
  return stripeWebhookSecret ?? null;
}

export function getStripeFeaturedPriceId(): string | null {
  return featuredPriceId ?? null;
}

export function getFeaturedPriceLabel(): string | null {
  return featuredPriceLabel ?? null;
}

export function getFeaturedDurationDays(): number {
  const raw = process.env.FEATURED_DURATION_DAYS;
  const parsed = raw ? Number(raw) : 7;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 7;
  }
  return Math.floor(parsed);
}

export function createStripeClient(): Stripe | null {
  if (!stripeSecretKey) {
    return null;
  }

  return new Stripe(stripeSecretKey, {
  });
}
