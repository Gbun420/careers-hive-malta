import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import {
  createStripeClient,
  getStripeFeaturedPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export const runtime = "nodejs";

const BodySchema = z.object({
  job_id: z.string().min(1, "Job is required."),
});

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return jsonError(
      "STRIPE_NOT_CONFIGURED",
      "Stripe is not configured.",
      503
    );
  }

  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "employer") {
    return jsonError("FORBIDDEN", "Employer access required.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = BodySchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, employer_id, title")
    .eq("id", parsed.data.job_id)
    .eq("employer_id", authData.user.id)
    .maybeSingle();

  if (jobError || !job) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
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

  const service = createServiceRoleClient();
  if (!service) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const origin =
    request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let session;
  try {
    session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/employer/jobs?featured=success`,
      cancel_url: `${origin}/employer/jobs?featured=cancel`,
      metadata: {
        employer_id: authData.user.id,
        job_id: job.id,
        type: "featured",
      },
      customer_email: authData.user.email ?? undefined,
    });
  } catch (stripeError) {
    return jsonError("DB_ERROR", "Unable to create checkout session.", 500);
  }

  if (!session.url) {
    return jsonError("DB_ERROR", "Unable to create checkout session.", 500);
  }

  const { error: insertError } = await service.from("purchases").insert({
    employer_id: authData.user.id,
    job_id: job.id,
    type: "featured",
    stripe_checkout_session_id: session.id,
    status: "pending",
  });

  if (insertError) {
    return jsonError("DB_ERROR", insertError.message, 500);
  }

  return NextResponse.json({ url: session.url });
}
