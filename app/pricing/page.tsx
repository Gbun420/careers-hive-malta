import Link from "next/link";
import SiteHeader from "@/components/nav/site-header";
import { Button } from "@/components/ui/button";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  isStripeConfigured,
} from "@/lib/billing/stripe";

export default function PricingPage() {
  const stripeEnabled = isStripeConfigured();
  const featuredDurationDays = getFeaturedDurationDays();
  const featuredPriceLabel = getFeaturedPriceLabel();

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
              {stripeEnabled && featuredPriceLabel
                ? `Feature a job for ${featuredPriceLabel}`
                : "Feature a job to unlock premium placement."}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Top placement for {featuredDurationDays} days</li>
              <li>• Appears first in search</li>
              <li>• Featured badge on listings</li>
            </ul>
            <div className="mt-6">
              {stripeEnabled ? (
                <Button asChild size="lg">
                  <Link href="/signup?role=employer">Upgrade a job</Link>
                </Button>
              ) : (
                <Button size="lg" disabled>
                  Billing coming soon
                </Button>
              )}
            </div>
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
    </div>
  );
}
