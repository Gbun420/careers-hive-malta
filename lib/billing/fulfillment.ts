import "server-only";
import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getFeaturedDurationDays } from "@/lib/billing/stripe";
import { logAudit } from "@/lib/audit/log";
import { upsertJobs } from "@/lib/search/meili";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import type { Job } from "@/lib/jobs/schema";
import type { ErrorCode } from "@/lib/api/errors";

export type FulfillmentError = {
  code: ErrorCode;
  message: string;
  status: number;
  details?: Record<string, unknown>;
};

export type FulfillmentResult =
  | {
      ok: true;
      jobId: string;
      featuredUntil: string;
    }
  | {
      ok: false;
      error: FulfillmentError;
    };

export async function fulfillFeaturedCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<FulfillmentResult> {
  const metadata = session.metadata ?? {};
  const employerId = metadata.employer_id;
  const jobId = metadata.job_id;
  const type = metadata.type;

  if (!employerId || !jobId || type !== "featured") {
    return {
      ok: false,
      error: {
        code: "WEBHOOK_BAD_EVENT",
        message: "Missing checkout metadata.",
        status: 400,
      },
    };
  }

  const service = createServiceRoleClient();
  if (!service) {
    return {
      ok: false,
      error: {
        code: "SUPABASE_NOT_CONFIGURED",
        message: "Supabase is not configured.",
        status: 503,
      },
    };
  }

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : null;

  const { data: existing, error: existingError } = await service
    .from("purchases")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: "Unable to read purchase record.",
        status: 500,
        details: {
          table: "purchases",
          message: existingError.message,
        },
      },
    };
  }

  if (existing) {
    const { error: updateError } = await service
      .from("purchases")
      .update({
        status: "paid",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", existing.id);

    if (updateError) {
      return {
        ok: false,
        error: {
          code: "DB_UPDATE_FAILED",
          message: "Unable to update purchase.",
          status: 500,
          details: {
            table: "purchases",
            message: updateError.message,
          },
        },
      };
    }
  } else {
    const { error: insertError } = await service.from("purchases").insert({
      employer_id: employerId,
      job_id: jobId,
      type: "featured",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      status: "paid",
    });

    if (insertError) {
      return {
        ok: false,
        error: {
          code: "DB_INSERT_FAILED",
          message: "Unable to record purchase.",
          status: 500,
          details: {
            table: "purchases",
            message: insertError.message,
          },
        },
      };
    }
  }

  const { data: currentFeature, error: featureReadError } = await service
    .from("job_featured")
    .select("featured_until")
    .eq("job_id", jobId)
    .maybeSingle();

  if (featureReadError) {
    return {
      ok: false,
      error: {
        code: "DB_ERROR",
        message: "Unable to read featured status.",
        status: 500,
        details: {
          table: "job_featured",
          message: featureReadError.message,
        },
      },
    };
  }

  const durationDays = getFeaturedDurationDays();
  const candidate = new Date(
    Date.now() + durationDays * 24 * 60 * 60 * 1000
  );
  const existingUntil = currentFeature?.featured_until
    ? new Date(currentFeature.featured_until)
    : null;
  const featuredUntil =
    existingUntil && existingUntil > candidate ? existingUntil : candidate;

  const { error: featureUpdateError } = await service.from("job_featured").upsert({
    job_id: jobId,
    featured_until: featuredUntil.toISOString(),
    featured_tier: 1,
    updated_at: new Date().toISOString(),
  });

  if (featureUpdateError) {
    return {
      ok: false,
      error: {
        code: "DB_UPDATE_FAILED",
        message: "Unable to update featured status.",
        status: 500,
        details: {
          table: "job_featured",
          message: featureUpdateError.message,
        },
      },
    };
  }

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

  return {
    ok: true,
    jobId,
    featuredUntil: featuredUntil.toISOString(),
  };
}
