import { NextResponse } from "next/server";
import Stripe from "stripe";
import { jsonError } from "@/lib/api/errors";
import {
  createStripeClient,
  getFeaturedDurationDays,
  getStripeWebhookSecret,
  isStripeWebhookConfigured,
} from "@/lib/billing/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit/log";
import { upsertJobs } from "@/lib/search/meili";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import type { Job } from "@/lib/jobs/schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
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
  const metadata = session.metadata ?? {};
  const employerId = metadata.employer_id;
  const jobId = metadata.job_id;
  const type = metadata.type;

  if (!employerId || !jobId || type !== "featured") {
    return jsonError("INVALID_INPUT", "Missing checkout metadata.", 400);
  }

  const service = createServiceRoleClient();
  if (!service) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  const { data: existing } = await service
    .from("purchases")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existing) {
    await service
      .from("purchases")
      .update({
        status: "paid",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", existing.id);
  } else {
    await service.from("purchases").insert({
      employer_id: employerId,
      job_id: jobId,
      type: "featured",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      status: "paid",
    });
  }

  const durationDays = getFeaturedDurationDays();
  const featuredUntil = new Date(
    Date.now() + durationDays * 24 * 60 * 60 * 1000
  ).toISOString();

  await service.from("job_featured").upsert({
    job_id: jobId,
    featured_until: featuredUntil,
    featured_tier: 1,
    updated_at: new Date().toISOString(),
  });

  const { data: job } = await service
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .eq("id", jobId)
    .maybeSingle();

  if (job) {
    const [withFeatured] = await attachFeaturedStatus([job as Job]);
    const [enriched] = await attachEmployerVerified([
      (withFeatured ?? job) as Job,
    ]);
    const jobForIndex = (enriched ?? withFeatured ?? job) as Job;
    try {
      await upsertJobs([jobForIndex]);
    } catch (indexError) {
      // Best-effort indexing only.
    }
  }

  await logAudit({
    actorId: employerId,
    action: "featured_purchased",
    entityType: "job",
    entityId: jobId,
    meta: {
      purchase_type: "featured",
      checkout_session_id: session.id,
    },
  });

  return NextResponse.json({ received: true });
}
