import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/nav/site-header";
import { Button } from "@/components/ui/button";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  getStripeFeaturedPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "Pricing | Careers.mt",
  description:
    "Flexible pricing for hiring in Malta. Post jobs for free or feature urgent roles.",
  ...(siteUrl
    ? {
        alternates: {
          canonical: `${siteUrl}/pricing`,
        },
      }
    : {}),
};

import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "@/components/nav/site-header";
import { Button } from "@/components/ui/button";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  getStripeFeaturedPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";
import { fetchDynamicMetrics } from "@/lib/metrics";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "Pricing | Careers.mt",
  description:
    "Flexible pricing for hiring in Malta. Post jobs for free or feature urgent roles.",
  ...(siteUrl
    ? {
        alternates: {
          canonical: `${siteUrl}/pricing`,
        },
      }
    : {}),
};

export default async function PricingPage() {
  const billingConfigured = isStripeConfigured();
  const featuredDurationDays = getFeaturedDurationDays();
  const featuredPriceLabel = getFeaturedPriceLabel();
  const showBillingStatus = process.env.NODE_ENV !== "production";
  const featuredPriceId = getStripeFeaturedPriceId();
  const showPlaceholderWarning =
    showBillingStatus &&
    typeof featuredPriceId === "string" &&
    featuredPriceId.includes("placeholder");

  const metrics = await fetchDynamicMetrics({
    queries: ['featured_adoption_rate', 'avg_applications_per_job'],
    fallbacks: true
  });

  const featuredAdoption = metrics.featured_adoption_rate?.value;
  const avgApps = metrics.avg_applications_per_job?.value;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16">
        <header className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Pricing
          </p>
          <h1 className="font-display text-4xl font-semibold text-slate-900">
            Plans for hiring faster in Malta
          </h1>
          <p className="max-w-2xl text-slate-600">
            Start with a free listing, then boost priority roles to the top of
            the feed and search results for {featuredDurationDays} days.
          </p>
          {featuredAdoption && featuredAdoption !== 0 && (
            <p className="text-sm font-medium text-brand-600">
              {featuredAdoption}% of employers upgrade to featured placement for maximum visibility.
            </p>
          )}
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Free job post</p>
            <p className="mt-2 text-sm text-slate-600">
              Publish a job to the public feed with standard visibility.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Visible on the Malta job feed</li>
              <li>• Included in alert matching</li>
              <li>• Report + moderation coverage</li>
            </ul>
            <Button asChild size="lg" className="mt-6">
              <Link href="/signup?role=employer">Post a free job</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Featured upgrade
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {billingConfigured && featuredPriceLabel
                ? `Feature a job for ${featuredPriceLabel}`
                : "Feature a job to unlock premium placement."}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Top placement for {featuredDurationDays} days</li>
              <li>• Appears first in search</li>
              <li>• Featured badge on listings</li>
              {avgApps && (
                <li className="font-semibold text-amber-900">• Attract an average of {avgApps} candidates</li>
              )}
            </ul>
            <div className="mt-6">
              {billingConfigured ? (
                <Button asChild size="lg">
                  <Link href="/signup?role=employer">Upgrade a job</Link>
                </Button>
              ) : (
                <Button size="lg" disabled>
                  Billing not configured
                </Button>
              )}
              {!billingConfigured ? (
                <p className="mt-2 text-xs text-slate-600">
                  Billing not configured.{" "}
                  <Link href="/setup" className="underline">
                    View setup
                  </Link>
                  .
                </p>
              ) : null}
            </div>
            {showPlaceholderWarning ? (
              <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Stripe price ID is a placeholder; checkout will fail in this
                environment.
              </p>
            ) : null}
            <p className="mt-4 text-xs text-slate-600">
              Verified employers stand out with trust badges.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Subscription (coming soon)
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Bundle multiple featured upgrades with monthly credits.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Priority employer support</li>
              <li>• Featured credits included</li>
              <li>• Team hiring dashboard</li>
            </ul>
            <Button size="lg" disabled className="mt-6">
              Coming soon
            </Button>
          </div>
        </section>
      </main>
      {showBillingStatus ? (
        <footer className="mx-auto w-full max-w-6xl px-6 pb-10 text-xs text-slate-500">
          Billing: {billingConfigured ? "configured" : "not configured"} ·
          Featured duration: {featuredDurationDays} days · 
          Metrics updated {metrics.featured_adoption_rate?.lastUpdated}
        </footer>
      ) : null}
    </div>
  );
}
