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
        <div className="card-gradient rounded-2xl border border-slate-200 p-8 shadow-sm lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-600">
            For employers
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold text-slate-900">
            Hire faster with verified visibility
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            Post roles, request verification, and reach active Maltese talent.
            Featured upgrades lift priority roles above the noise.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href={employerSignupHref}>Post a job now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/employer/verification">Request verification</Link>
            </Button>
          </div>
        </div>

        <div
          id="pricing"
          className="rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <p className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-brand-400 relative z-10">
            Pricing
          </p>
          <h3 className="mt-4 text-3xl font-extrabold tracking-tightest relative z-10">
            Featured Job <span className="text-brand-400 italic">Upgrades.</span>
          </h3>
          <p className="mt-4 text-slate-400 leading-relaxed relative z-10">
            {featuredEnabled
              ? "Stripe Checkout is ready for featured boosts. Set your pricing in Stripe."
              : "Enable Stripe to unlock featured boosts for priority visibility."}
          </p>
          <ul className="mt-8 space-y-5 text-sm font-semibold text-slate-300 relative z-10">
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Pay per featured job
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Boosted ranking in search and feeds
            </li>
            <li className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              Real-time matching dashboard
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
