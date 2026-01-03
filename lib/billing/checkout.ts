import "server-only";
import {
  createStripeClient,
  getStripeFeaturedPriceId,
  isStripeConfigured,
  mapStripeError,
} from "@/lib/billing/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ErrorCode } from "@/lib/api/errors";

export type CheckoutError = {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export type FeaturedCheckoutResult =
  | {
      url: string;
      sessionId: string;
      dbRecorded: boolean;
      dbError?: CheckoutError;
    }
  | { error: CheckoutError };

type FeaturedCheckoutInput = {
  employerId: string;
  jobId: string;
  customerEmail?: string | null;
  origin: string;
  allowDbFailure?: boolean;
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
    const mapped = mapStripeError(stripeError);
    console.error(
      JSON.stringify({
        event: "stripe_checkout_error",
        error_code: mapped.code,
        message: mapped.message,
        ...mapped.details,
      })
    );
    return {
      error: mapped,
    };
  }

  if (!session.url) {
    return {
      error: {
        code: "STRIPE_ERROR",
        message: "Stripe session URL missing.",
        status: 500,
        details: {
          stripe_session_id: session.id,
        },
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
    const error: CheckoutError = {
      code: "DB_INSERT_FAILED",
      message: "Unable to record purchase.",
      status: 500,
      details: {
        table: "purchases",
        message: insertError.message,
      },
    };

    if (input.allowDbFailure) {
      return {
        url: session.url,
        sessionId: session.id,
        dbRecorded: false,
        dbError: error,
      };
    }

    return { error };
  }

  return { url: session.url, sessionId: session.id, dbRecorded: true };
}
