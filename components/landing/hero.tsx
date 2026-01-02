import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroProps = {
  employerSignupHref: string;
};

export default function Hero({ employerSignupHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,116,144,0.16),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.18),_transparent_45%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-14 pt-12 sm:pb-16 sm:pt-16">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="w-fit rounded-full border border-teal-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 shadow-sm">
              Malta job alerts
            </span>
            <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Verified employers
            </span>
          </div>
          <div className="max-w-3xl">
            <h1
              className="font-display text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl lg:text-6xl"
              style={{ textWrap: "balance" }}
            >
              Fastest job alerts in Malta, curated by verified employers.
            </h1>
          </div>
          <p className="max-w-2xl text-lg text-slate-700 sm:text-xl">
            Get notified in minutes, filter the noise, and apply while the role
            is still fresh. Alerts arrive instantly or as a daily or weekly
            digest.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href="/signup">Get job alerts</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
            <Link
              href={employerSignupHref}
              className="text-sm font-semibold text-teal-700 underline underline-offset-4"
            >
              Post a job
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
