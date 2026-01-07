"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Bell, Sparkles, ArrowRight } from "lucide-react";

type HeroProps = {
  employerSignupHref: string;
};

export default function Hero({ employerSignupHref }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-20 lg:py-32 border-b">
      {/* Advanced Hero Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" 
           style={{ 
             background: `
               radial-gradient(circle at 20% 50%, hsla(var(--brand), 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, hsla(var(--brand), 0.05) 0%, transparent 50%),
               linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)
             `,
           }} 
      />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left observe-on-scroll">
            <div className="w-16 h-1 bg-brand rounded-full mb-10" />
            
            <h1 className="text-5xl font-black leading-[1.1] text-foreground sm:text-6xl lg:text-7xl tracking-tightest uppercase">
              Malta&apos;s High<br />
              <span className="text-brand italic font-serif">Performance</span><br />
              Job Feed.
            </h1>
            
            <p className="mt-8 max-w-lg text-xl text-muted-foreground leading-relaxed font-medium">
              Real-time alerts from verified Maltese employers. Apply before the competition with zero latency.
            </p>
            
            <div className="mt-12 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="default" className="rounded-xl px-10 shadow-cta hover:shadow-cta-hover transition-all h-16 text-lg bg-brand text-white border-none">
                <Link href="/signup" className="flex items-center gap-2" aria-label="Get instant job alerts">Get Job Alerts <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-10 h-16 text-lg border-2 border-brand/20 hover:bg-brand/5 text-brand">
                <Link href="/jobs" aria-label="Browse all active jobs">Browse Jobs</Link>
              </Button>
            </div>

            <div className="mt-16 flex flex-col gap-5">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                Verified Maltese Professionals
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                Direct access to hiring teams
              </div>
            </div>
          </div>

          <div className="relative group observe-on-scroll delay-200">
            <div className="absolute inset-0 bg-brand/5 blur-[80px] rounded-[3rem] pointer-events-none group-hover:bg-brand/10 transition-colors duration-500" />
            <div className="relative border border-border bg-card/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl lg:p-12">
              <div className="flex flex-col gap-10 text-foreground">
                <div className="flex items-start gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Verified employers only</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Every company is manually vetted to ensure high-quality, legitimate opportunities.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent shadow-sm">
                    <Bell className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Real-time job alerts</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Get notified the second a job matching your criteria is posted. Zero latency.</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-sm">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Quality-first moderation</h3>
                    <p className="mt-1 text-sm text-muted-foreground">We filter the noise so you only see the most relevant roles in the Maltese market.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <div className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
                Zero-Latency Market Feed
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}