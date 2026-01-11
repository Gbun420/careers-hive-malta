import "server-only";
import Stripe from "stripe";
import type { ErrorCode } from "@/lib/api/errors";
import { SITE_URL } from "@/lib/site/url";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const priceJobPost = process.env.STRIPE_PRICE_JOB_POST;
const priceFeaturedAddon = process.env.STRIPE_PRICE_FEATURED_ADDON ?? process.env.STRIPE_FEATURED_PRICE_ID;
const priceProSub = process.env.STRIPE_PRICE_PRO_SUB;

const featuredPriceLabel =
  process.env.FEATURED_PRICE_LABEL ?? process.env.STRIPE_FEATURED_PRICE_LABEL;

export const stripeConfig = {
  successUrl: process.env.STRIPE_SUCCESS_URL || `${SITE_URL}/employer/billing/success`,
  cancelUrl: process.env.STRIPE_CANCEL_URL || `${SITE_URL}/pricing`,
  taxEnabled: process.env.STRIPE_TAX_ENABLED === "true",
};

export function isStripeConfigured(): boolean {
  return Boolean(stripeSecretKey && priceJobPost && priceFeaturedAddon && priceProSub);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(stripeSecretKey && stripeWebhookSecret);
}

export function getStripeWebhookSecret(): string | null {
  return stripeWebhookSecret ?? null;
}

export function getStripeFeaturedPriceId(): string | null {
  return priceFeaturedAddon ?? null;
}

export function getPriceId(product: "JOB_POST" | "FEATURED_ADDON" | "PRO_SUB"): string | null {
  switch (product) {
    case "JOB_POST": return priceJobPost ?? null;
    case "FEATURED_ADDON": return priceFeaturedAddon ?? null;
    case "PRO_SUB": return priceProSub ?? null;
    default: return null;
  }
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

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  mode: 'payment' | 'subscription' = 'payment'
) {
  const stripe = createStripeClient();
  if (!stripe) throw new Error('Stripe not configured');

  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/employer/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/pricing`,
    metadata: {
      user_id: userId,
      price_id: priceId,
    },
  });

  return { sessionId: session.id, url: session.url };
}

export async function handleWebhookEvent(payload: string | Buffer, sig: string) {
  const stripe = createStripeClient();
  if (!stripe || !stripeWebhookSecret) throw new Error('Stripe or Webhook secret not configured');
  
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err}`);
  }

  return event;
}

type StripeErrorInfo = {
  code: ErrorCode;
  message: string;
  status: number;
  details: Record<string, unknown>;
};

export function mapStripeError(error: unknown): StripeErrorInfo {
  const stripeType =
    typeof error === "object" && error !== null && "type" in error
      ? (error as { type?: string }).type
      : undefined;
  const stripeCode =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code?: string }).code
      : undefined;
  const stripeStatusCode =
    typeof error === "object" && error !== null && "statusCode" in error
      ? (error as { statusCode?: number }).statusCode
      : undefined;
  const stripeMessage =
    typeof error === "object" && error !== null && "message" in error
      ? (error as { message?: string }).message
      : undefined;

  const details = {
    stripe_type: stripeType ?? null,
    stripe_code: stripeCode ?? null,
    stripe_statusCode: stripeStatusCode ?? null,
    stripe_message: stripeMessage ?? null,
  };

  if (
    stripeType === "StripeInvalidRequestError" &&
    (stripeCode === "resource_missing" ||
      (stripeMessage && stripeMessage.toLowerCase().includes("no such price")))
  ) {
    return {
      code: "STRIPE_PRICE_INVALID",
      message: "Stripe price is invalid.",
      status: 400,
      details,
    };
  }

  if (stripeType === "StripeAuthenticationError") {
    return {
      code: "STRIPE_AUTH_ERROR",
      message: "Stripe authentication failed.",
      status: 500,
      details,
    };
  }

  return {
    code: "STRIPE_ERROR",
    message: "Stripe request failed.",
    status: 500,
    details,
  };
}
