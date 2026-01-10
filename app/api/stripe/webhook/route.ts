import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { fulfillFeaturedCheckoutSession, fulfillSubscription, handleSubscriptionDeleted } from "@/lib/billing/fulfillment";
import { SITE_URL } from "@/lib/site/url";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    console.error("Missing STRIPE_SECRET_KEY");
    return new Response("Stripe secret not configured", { status: 500 });
  }

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2025-01-27" as any,
  });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature) throw new Error("No stripe-signature header");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  console.log(`[Stripe Webhook] Processing event: ${event.type} (${event.id})`);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      if (session.payment_status === "paid") {
        const result = await fulfillFeaturedCheckoutSession(session);
        if (!result.ok) {
          console.error("[Stripe Webhook] Featured fulfillment failed:", result.error);
          return new Response(`Fulfillment Error: ${result.error.message}`, { status: 500 });
        }
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as any;
      if (invoice.subscription) {
        await fulfillSubscription(invoice.subscription as string, stripe);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      await handleSubscriptionDeleted(subscription.id);
      break;
    }
    default:
    // Unhandled event type
  }

  return NextResponse.json({ received: true });
}