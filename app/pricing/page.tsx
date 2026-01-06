import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  getFeaturedDurationDays,
  getFeaturedPriceLabel,
  getStripeFeaturedPriceId,
  isStripeConfigured,
} from "@/lib/billing/stripe";
import { PageShell } from "@/components/ui/page-shell";
import { SectionHeading } from "@/components/ui/section-heading";

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

  // High-conversion pricing logic: ensure we never show a "0" or empty price
  const displayPrice = billingConfigured && featuredPriceLabel && featuredPriceLabel !== "0" && featuredPriceLabel !== "€0"
    ? featuredPriceLabel 
    : "€49";

  return (
    <PageShell>
      <div className="flex flex-col gap-10">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Pricing
          </p>
          <SectionHeading 
            title="Plans for hiring faster in Malta" 
            subtitle={`Start with a free listing, then boost priority roles to the top of the feed and search results for ${featuredDurationDays} days.`}
            align="center"
          />
          <p className="text-sm font-medium text-brand">
            Trusted by verified Maltese brands for high-performance recruitment.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-950">Free Post</h3>
            <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
              Publish a job to the public feed with standard visibility.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Visible on the Malta job feed
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Included in alert matching
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Report + moderation coverage
              </li>
            </ul>
            <Button asChild size="lg" variant="outline" className="mt-8 w-full rounded-2xl border-brand/20 text-brand hover:bg-brand/5" aria-label="Post a job for free">
              <Link href="/signup?role=employer">Post for Free</Link>
            </Button>
          </div>

          {/* Featured Plan */}
          <div className="rounded-3xl border-2 border-brand bg-brand/5 p-8 shadow-premium flex flex-col relative overflow-hidden scale-105 z-10">
            <div className="absolute top-0 right-0 bg-brand text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest">
              Most Popular
            </div>
            <h3 className="text-xl font-black text-slate-950">Featured Upgrade</h3>
            <p className="mt-2 text-sm text-slate-700 font-medium leading-relaxed">
              Only {displayPrice} per post
            </p>
            <ul className="mt-8 space-y-4 text-sm text-slate-700 flex-1">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Top placement for {featuredDurationDays} days
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Appears first in search results
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Distinctive Featured badge
              </li>
              <li className="flex items-start gap-3 font-bold text-brand">
                <span className="text-emerald-600 font-black">✓</span>
                Verified trust signal
              </li>
            </ul>
            <div className="mt-8">
              <Button asChild size="lg" className="w-full rounded-2xl shadow-cta bg-brand text-white border-none" aria-label="Feature a job upgrade">
                <Link href="/signup?role=employer">Feature a Job</Link>
              </Button>
            </div>
            {showPlaceholderWarning && (
              <p className="mt-4 text-center text-[10px] text-brand font-black uppercase tracking-widest">
                Stripe Sandbox Active
              </p>
            )}
          </div>

          {/* Pro Plan */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col">
            <h3 className="text-xl font-black text-slate-950">Professional</h3>
            <p className="mt-2 text-sm text-slate-600 font-medium leading-relaxed">
              Unlimited posting and team-wide hiring tools.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-slate-600 flex-1">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Unlimited job postings
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Advanced ROI analytics
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Team hiring dashboard
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 font-black">✓</span>
                Priority employer support
              </li>
            </ul>
            <Button size="lg" disabled className="mt-8 w-full rounded-2xl" variant="outline">
              Coming soon
            </Button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-32 max-w-3xl mx-auto w-full">
          <SectionHeading title="Frequently Asked Questions" align="center" />
          <div className="grid gap-4 mt-12">
            {[
              { q: "How long does a featured post last?", a: `Featured posts stay at the top of the feed for ${featuredDurationDays} days, after which they revert to standard listings.` },
              { q: "Do you offer bulk discounts?", a: "Yes, our Professional plan is designed for companies with high-volume hiring needs. Contact us for custom enterprise pricing." },
              { q: "Is verification mandatory?", a: "Verification is recommended to build trust with candidates, but you can post roles immediately after signing up." },
              { q: "What is the average time-to-hire?", a: "Most verified employers on Careers.mt fill their roles within 14-21 days." }
            ].map((faq, i) => (
              <div key={i} className="rounded-[2rem] border border-slate-200 bg-white p-8">
                <h4 className="font-black text-slate-950 mb-3 tracking-tight">{faq.q}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      {showBillingStatus && (
        <footer className="mt-20 pt-10 border-t border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
          Engine: production-ready · Billing: {billingConfigured ? "sync" : "pending"} · Last Update: {new Date().toLocaleDateString()}
        </footer>
      )}
    </PageShell>
  );
}