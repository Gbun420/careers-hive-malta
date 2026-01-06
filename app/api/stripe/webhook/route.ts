import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createStripeClient, getStripeWebhookSecret } from "@/lib/billing/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature") as string;
  const webhookSecret = getStripeWebhookSecret();
  const stripe = createStripeClient();

  if (!stripe || !signature || !webhookSecret) {
    return new Response("Webhook configuration missing", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { companyId, jobId, product } = session.metadata || {};

      if (!companyId) break;

      if (session.mode === "payment") {
        // 1. Mark Purchase Paid
        await supabase
          .from("purchases")
          .update({ status: "paid", stripe_payment_intent_id: session.payment_intent as string })
          .eq("stripe_checkout_session_id", session.id);

        // 2. Provision Entitlement
        if (product === "JOB_POST" && jobId) {
          await supabase.from("jobs").update({ is_active: true }).eq("id", jobId);
        } else if (product === "FEATURED_ADDON" && jobId) {
          const featuredUntil = new Date();
          featuredUntil.setDate(featuredUntil.getDate() + 7);
          await supabase.from("jobs").update({ 
            is_featured: true, 
            featured_until: featuredUntil.toISOString() 
          }).eq("id", jobId);
        }
      }

      if (session.mode === "subscription") {
        const subscriptionId = session.subscription as string;
        const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
        
        await supabase
          .from("profiles")
          .update({
            plan: "PRO",
            plan_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", companyId);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const companyId = subscription.metadata?.companyId;

      if (companyId) {
        await supabase
          .from("profiles")
          .update({
            plan_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", companyId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
