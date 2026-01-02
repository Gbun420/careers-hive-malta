import "server-only";
import {
  createStripeClient,
  getStripeFeaturedPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ErrorCode } from "@/lib/api/errors";

export type CheckoutError = {
  code: ErrorCode;
  message: string;
  status: number;
};

export type FeaturedCheckoutResult =
  | { url: string; sessionId: string }
  | { error: CheckoutError };

type FeaturedCheckoutInput = {
  employerId: string;
  jobId: string;
  customerEmail?: string | null;
  origin: string;
};

export async function createFeaturedCheckoutSession(
  input: FeaturedCheckoutInput
): Promise<FeaturedCheckoutResult> {
  if (!isStripeConfigured()) {
    return {
      error: {
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured.",
        status: 503,
      },
    };
  }

  const stripe = createStripeClient();
  const priceId = getStripeFeaturedPriceId();
  if (!stripe || !priceId) {
    return {
      error: {
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured.",
        status: 503,
      },
    };
  }

  const service = createServiceRoleClient();
  if (!service) {
    return {
      error: {
        code: "SUPABASE_NOT_CONFIGURED",
        message: "Supabase is not configured.",
        status: 503,
      },
    };
  }

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${input.origin}/employer/jobs?featured=success`,
      cancel_url: `${input.origin}/employer/jobs?featured=cancel`,
      metadata: {
        employer_id: input.employerId,
        job_id: input.jobId,
        type: "featured",
      },
      customer_email: input.customerEmail ?? undefined,
    });
  } catch (stripeError) {
    return {
      error: {
        code: "DB_ERROR",
        message: "Unable to create checkout session.",
        status: 500,
      },
    };
  }

  if (!session.url) {
    return {
      error: {
        code: "DB_ERROR",
        message: "Unable to create checkout session.",
        status: 500,
      },
    };
  }

  const { error: insertError } = await service.from("purchases").insert({
    employer_id: input.employerId,
    job_id: input.jobId,
    type: "featured",
    stripe_checkout_session_id: session.id,
    status: "pending",
  });

  if (insertError) {
    return {
      error: {
        code: "DB_ERROR",
        message: insertError.message,
        status: 500,
      },
    };
  }

  return { url: session.url, sessionId: session.id };
}
