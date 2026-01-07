import "server-only";
import {
  createStripeClient,
  getPriceId,
  isStripeConfigured,
  mapStripeError,
  stripeConfig,
} from "@/lib/billing/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ErrorCode } from "@/lib/api/errors";

export type CheckoutProduct = "JOB_POST" | "FEATURED_ADDON" | "PRO_SUB";

export type CheckoutError = {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export type CheckoutResult =
  | {
      url: string;
      sessionId: string;
    }
  | { error: CheckoutError };

export type FeaturedCheckoutResult =
  | {
      url: string;
      sessionId: string;
      dbRecorded: boolean;
      dbError?: CheckoutError;
    }
  | { error: CheckoutError };

type CheckoutInput = {
  companyId: string;
  jobId?: string;
  product: CheckoutProduct;
  customerEmail?: string | null;
  origin: string;
};

export async function createCheckoutSession(
  input: CheckoutInput
): Promise<CheckoutResult> {
  const stripe = createStripeClient();
  const priceId = getPriceId(input.product);
  
  if (!stripe || !priceId) {
    return {
      error: {
        code: "STRIPE_NOT_CONFIGURED",
        message: "Stripe is not configured correctly.",
        status: 503,
      },
    };
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return {
      error: {
        code: "SUPABASE_NOT_CONFIGURED",
        message: "Supabase is not configured.",
        status: 503,
      },
    };
  }

  // 1. Get or Create Stripe Customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", input.companyId)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    try {
      const customer = await stripe.customers.create({
        email: input.customerEmail ?? undefined,
        name: profile?.full_name ?? undefined,
        metadata: { companyId: input.companyId },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", input.companyId);
    } catch (err) {
      console.error("Failed to create Stripe customer", err);
    }
  }

  // 2. Create Checkout Session
  const isSubscription = input.product === "PRO_SUB";
  
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSubscription ? "subscription" : "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${stripeConfig.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: stripeConfig.cancelUrl,
      automatic_tax: { enabled: stripeConfig.taxEnabled },
      customer_update: { address: "auto" },
      billing_address_collection: "required",
      metadata: {
        companyId: input.companyId,
        jobId: input.jobId ?? "",
        product: input.product,
      },
    });

    if (!session.url) throw new Error("Missing session URL");

    // 3. For one-time purchases, record in DB immediately as pending
    if (!isSubscription && input.jobId) {
      await supabase.from("purchases").insert({
        employer_id: input.companyId,
        job_id: input.jobId,
        type: input.product,
        stripe_checkout_session_id: session.id,
        status: "pending",
      });
    }

    return { url: session.url, sessionId: session.id };
  } catch (err) {
    const mapped = mapStripeError(err);
    return { error: mapped };
  }
}

/** Legacy alias */
export async function createFeaturedCheckoutSession(input: {
  employerId: string;
  jobId: string;
  customerEmail?: string | null;
  origin: string;
  allowDbFailure?: boolean;
}): Promise<FeaturedCheckoutResult> {
  const result = await createCheckoutSession({
    companyId: input.employerId,
    jobId: input.jobId,
    product: "FEATURED_ADDON",
    customerEmail: input.customerEmail,
    origin: input.origin,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  return {
    url: result.url,
    sessionId: result.sessionId,
    dbRecorded: true, // New unified flow inserts into purchases if jobId present
  };
}