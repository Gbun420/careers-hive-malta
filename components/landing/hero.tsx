import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroProps = {
  employerSignupHref: string;
};

export default function Hero({ employerSignupHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.08),_transparent_50%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.05),_transparent_50%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-16 sm:pb-24 sm:pt-24">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3 animate-fade-up">
            <span className="w-fit rounded-full border border-brand-100 bg-brand-50/50 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-700 shadow-sm">
              Malta job alerts
            </span>
            <span className="w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
              Verified employers
            </span>
          </div>
          <div className="max-w-4xl animate-fade-up-delayed">
            <h1
              className="font-display text-5xl font-bold leading-[1.1] text-slate-900 sm:text-6xl lg:text-7xl"
              style={{ textWrap: "balance" }}
            >
              The fastest job alerts in Malta, curated for you.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl animate-fade-up-delayed">
            Get notified in minutes, skip the noise, and apply before everyone else. 
            Real-time notifications from Malta&apos;s most trusted employers.
          </p>
          <div className="flex flex-wrap items-center gap-4 animate-fade-up-delayed">
            <Button asChild size="lg">
              <Link href="/signup">Get started for free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/jobs">Explore jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
