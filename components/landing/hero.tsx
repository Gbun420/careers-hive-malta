import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroProps = {
  employerSignupHref: string;
};

export default function Hero({ employerSignupHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-20 sm:pb-32 sm:pt-32 text-center items-center">
        <div className="flex flex-col gap-8 items-center">
          <div className="flex flex-wrap items-center gap-2 animate-fade-up">
            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-inner-soft">
              Next-Gen Malta Job Board
            </span>
          </div>
          <div className="max-w-4xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <h1
              className="font-sans text-6xl font-extrabold leading-[0.95] text-slate-950 sm:text-7xl lg:text-8xl tracking-tightest"
              style={{ textWrap: "balance" }}
            >
              Find your next role, <span className="text-brand-600 italic">instantly.</span>
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Careers.mt delivers real-time job alerts from Malta&apos;s most trusted employers directly to your inbox. No noise, just opportunities.
          </p>
          <div className="flex flex-wrap items-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl text-lg">
              <Link href="/signup">Start your search</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-2xl text-lg">
              <Link href="/jobs">Browse all jobs</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
