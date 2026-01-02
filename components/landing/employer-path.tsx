import Link from "next/link";
import { Button } from "@/components/ui/button";

type EmployerPathProps = {
  featuredEnabled: boolean;
  employerSignupHref: string;
};

export default function EmployerPath({
  featuredEnabled,
  employerSignupHref,
}: EmployerPathProps) {
  return (
    <section
      id="for-employers"
      className="mx-auto w-full max-w-6xl px-6 pb-16"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            For employers
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900">
            Hire faster with verified visibility
          </h2>
          <p className="mt-3 text-slate-600">
            Post roles, request verification, and reach active Maltese talent.
            Featured upgrades lift priority roles above the noise.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={employerSignupHref}>Post a job</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/employer/verification">Request verification</Link>
            </Button>
          </div>
        </div>

        <div
          id="pricing"
          className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Pricing
          </p>
          <h3 className="mt-3 text-2xl font-semibold">
            Featured job upgrades
          </h3>
          <p className="mt-3 text-sm text-slate-200">
            {featuredEnabled
              ? "Stripe Checkout is ready for featured boosts. Set your pricing in Stripe."
              : "Enable Stripe to unlock featured boosts for priority visibility."}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>• Pay per featured job</li>
            <li>• Boosted ranking in search and feeds</li>
            <li>• Duration controlled via FEATURED_DURATION_DAYS</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
