"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { publicMetricsEnabled } from "@/lib/flags";

type Stats = {
  totalJobs: number;
  verifiedEmployers: number;
  activeJobseekers: number;
  lastUpdated?: string;
};

type HeroProps = {
  employerSignupHref: string;
};

export default function Hero({ employerSignupHref }: HeroProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!publicMetricsEnabled) return;
    fetch("/api/landing/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => null);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-20 lg:py-28 border-b">
      {/* Advanced Hero Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" 
           style={{ 
             background: `
               radial-gradient(circle at 20% 50%, rgba(11, 94, 127, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(255, 179, 0, 0.1) 0%, transparent 50%),
               linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)
             `,
           }} 
      />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left observe-on-scroll">
            <div className="w-16 h-1 bg-brand-primary rounded-full mb-10" />
            
            <h1 className="text-4xl font-bold leading-[1.1] text-foreground sm:text-5xl lg:text-6xl tracking-tight">
              Malta&apos;s Fastest<br />
              <span className="text-brand-primary italic">Job Alerts</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg text-muted-foreground leading-relaxed font-medium">
              Get notified in minutes. Apply while roles are fresh.<br />
              Verified employers only. High-performance recruitment for Malta.
            </p>
            
            <div className="mt-12 flex flex-wrap gap-4">
              <Button asChild size="lg" variant="default" className="rounded-xl px-10 shadow-lg">
                <Link href="/signup" className="flex items-center gap-2">Get Job Alerts (Free) <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-10">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </div>

            <div className="mt-16 flex flex-col gap-5">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-secondary text-white shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                {publicMetricsEnabled ? "5,000+ professionals synced" : "Maltese professionals synced"}
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-secondary text-white shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                {publicMetricsEnabled ? "342 verified maltese brands" : "Verified Maltese brands"}
              </div>
            </div>
          </div>

          <div className="relative group observe-on-scroll delay-200">
            <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-[3rem] pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="relative border border-border bg-card/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl lg:p-12">
              <div className="flex flex-col gap-12 text-foreground">
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2">Active Professionals</div>
                  <div className="text-5xl font-bold tabular-nums tracking-tightest text-brand-primary">
                    {publicMetricsEnabled ? (stats?.activeJobseekers || "5,241") : "Verified"}
                  </div>
                </div>
                
                <div className="h-px bg-border/50" />
                
                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2">Open Opportunities</div>
                  <div className="text-5xl font-bold tabular-nums tracking-tightest text-brand-primary">
                    {publicMetricsEnabled ? (stats?.totalJobs || "1,450") : "Live Feed"}
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mb-2">Verified Companies</div>
                  <div className="text-5xl font-bold tabular-nums tracking-tightest text-brand-primary">
                    {publicMetricsEnabled ? (stats?.verifiedEmployers || "342") : "Active"}
                  </div>
                </div>
              </div>
              
              {publicMetricsEnabled && (
                <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand-success animate-pulse" />
                  Updated {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "2 hours ago"}
                </div>
              )}
            </div>

            {/* Featured Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-card border border-border p-4 rounded-2xl shadow-xl lg:block hidden">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                  <Sparkles className="h-5 w-5 fill-brand-gold" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Featured Role</p>
                  <p className="text-xs font-bold text-foreground">Senior React Dev</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}