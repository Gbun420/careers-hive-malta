import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createStripeClient, getStripeWebhookSecret } from "@/lib/billing/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import Stripe from "stripe";
import { publishIndexingNotification } from "@/lib/google/indexing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature") as string;
  const webhookSecret = getStripeWebhookSecret();
  const stripe = createStripeClient();

  if (!stripe || !signature || !webhookSecret) {
    return new Response("Webhook configuration missing", { status: 500 });
  }

  const baseUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  // 1. Idempotency check
  const { data: existingEvent } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { companyId, jobId, product } = session.metadata || {};

        if (!companyId) throw new Error("Missing companyId in metadata");

        // A) Sync Customer
        await supabase.from("stripe_customers").upsert({
          user_id: companyId,
          stripe_customer_id: session.customer as string,
        });

        if (session.mode === "subscription") {
          const subscriptionId = session.subscription as string;
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          
          // B) Sync Subscription
          await supabase.from("stripe_subscriptions").upsert({
            user_id: companyId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            price_id: subscription.items.data[0].price.id,
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          });

          // C) Update Entitlements
          await supabase.from("employer_entitlements").upsert({
            user_id: companyId,
            plan: "PRO",
            can_post_jobs: true,
            updated_at: new Date().toISOString()
          });

          // D) Legacy Profile Update (Syncing for safety)
          await supabase.from("profiles").update({
            plan: "PRO",
            plan_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }).eq("id", companyId);
        }

        if (session.mode === "payment") {
          // B) Sync Purchase
          await supabase.from("stripe_purchases").insert({
            user_id: companyId,
            stripe_session_id: session.id,
            price_id: session.line_items?.data[0]?.price?.id || "unknown",
            metadata: session.metadata,
            consumed: false,
          });

          // C) Update Entitlements based on product type
          if (product === "JOB_POST") {
            const { data: current } = await supabase
              .from("employer_entitlements")
              .select("remaining_job_posts")
              .eq("user_id", companyId)
              .maybeSingle();
            
            const newCount = (current?.remaining_job_posts || 0) + 1;
            
            await supabase.from("employer_entitlements").upsert({
              user_id: companyId,
              remaining_job_posts: newCount,
              updated_at: new Date().toISOString()
            });

            // Also auto-activate the job if jobId provided
            if (jobId) {
              await supabase.from("jobs").update({ is_active: true, status: "active" }).eq("id", jobId);
              publishIndexingNotification(`${baseUrl}/jobs/${jobId}`, "URL_UPDATED", jobId);
            }
          } else if (product === "FEATURED_ADDON") {
            const featuredUntil = new Date();
            featuredUntil.setDate(featuredUntil.getDate() + 7);
            
            await supabase.from("employer_entitlements").upsert({
              user_id: companyId,
              featured_until: featuredUntil.toISOString(),
              updated_at: new Date().toISOString()
            });

            if (jobId) {
              await supabase.from("jobs").update({ 
                is_featured: true, 
                featured_until: featuredUntil.toISOString() 
              }).eq("id", jobId);
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { companyId } = subscription.metadata || {};

        if (companyId) {
          // Update Subscription Table
          await supabase.from("stripe_subscriptions").update({
            status: subscription.status,
            updated_at: new Date().toISOString()
          }).eq("stripe_subscription_id", subscription.id);

          // Update Entitlements
          await supabase.from("employer_entitlements").update({
            plan: "FREE",
            can_post_jobs: false,
            updated_at: new Date().toISOString()
          }).eq("user_id", companyId);

          // Update Profile
          await supabase.from("profiles").update({
            plan: "FREE",
            plan_status: subscription.status,
          }).eq("id", companyId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const { companyId } = subscription.metadata || {};
          if (companyId) {
            await supabase.from("employer_entitlements").update({
              can_post_jobs: false, // Disallow posting until paid
              updated_at: new Date().toISOString()
            }).eq("user_id", companyId);
          }
        }
        break;
      }
    }

    // 2. Log event as processed
    await supabase.from("stripe_events").insert({
      id: event.id,
      type: event.type,
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
}