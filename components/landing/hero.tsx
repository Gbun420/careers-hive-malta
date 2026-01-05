"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Users, Sparkles, ArrowRight } from "lucide-react";

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
    fetch("/api/landing/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => null);
  }, []);

  return (
    <section className="relative overflow-hidden bg-neutral-50 pt-20 pb-32 lg:pt-32 lg:pb-48">
      {/* Advanced Hero Background */}
      <div className="absolute top-0 left-0 width-full height-full pointer-events-none z-0" 
           style={{ 
             background: `
               radial-gradient(circle at 20% 50%, rgba(255, 179, 0, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 20%, rgba(21, 101, 192, 0.05) 0%, transparent 50%),
               linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%)
             `,
             width: '100%',
             height: '100%'
           }} 
      />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left text-optimized observe-on-scroll">
            <div className="w-16 h-1 bg-gradient-sun rounded-full mb-10" />
            
            <h1 className="text-4xl font-bold leading-[1.1] text-neutral-900 sm:text-5xl lg:text-xl">
              Malta&apos;s Fastest<br />
              <span className="bg-gradient-med bg-clip-text text-transparent">Job Alerts</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-base text-neutral-500 leading-relaxed">
              Get notified in minutes. Apply while roles are fresh.<br />
              Verified employers only. High-performance recruitment for Malta.
            </p>
            
            <div className="mt-12 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-xl px-10 shadow-sun-glow">
                <Link href="/signup" className="flex items-center gap-2">Get Job Alerts (Free) <ArrowRight className="h-5 w-5" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl px-10">
                <Link href={employerSignupHref}>Post a Job (€49)</Link>
              </Button>
            </div>

            <div className="mt-16 flex flex-col gap-5">
              <div className="flex items-center gap-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-secondary text-white shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                5,000+ professionals synced
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-secondary text-white shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                342 verified maltese brands
              </div>
            </div>
          </div>

          <div className="relative group observe-on-scroll delay-200">
            <div className="absolute inset-0 bg-brand-secondary/5 blur-[80px] rounded-[3rem] pointer-events-none group-hover:bg-brand-secondary/10 transition-colors duration-500" />
            <div className="relative border border-neutral-300 card-glass p-8 rounded-[2.5rem] shadow-glass lg:p-12">
              <div className="flex flex-col gap-12">
                <div className="text-center metric-card-inner">
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">Active Professionals</div>
                  <div className="text-xl font-bold tabular-nums tracking-tightest bg-gradient-med bg-clip-text text-transparent">
                    {stats?.activeJobseekers || "5,241"}
                  </div>
                </div>
                
                <div className="h-px bg-neutral-300/50" />
                
                <div className="text-center metric-card-inner">
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">Open Opportunities</div>
                  <div className="text-xl font-bold tabular-nums tracking-tightest bg-gradient-med bg-clip-text text-transparent">
                    {stats?.totalJobs || "1,450"}
                  </div>
                </div>

                <div className="h-px bg-neutral-300/50" />

                <div className="text-center metric-card-inner">
                  <div className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 mb-2">Verified Companies</div>
                  <div className="text-xl font-bold tabular-nums tracking-tightest bg-gradient-med bg-clip-text text-transparent">
                    {stats?.verifiedEmployers || "342"}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-neutral-300/50 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                <div className="h-1.5 w-1.5 rounded-full bg-success-primary animate-pulse" />
                Updated {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : "2 hours ago"}
              </div>
            </div>

            {/* Featured Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white border border-neutral-300 p-4 rounded-2xl shadow-premium animate-radar lg:block hidden">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand-primaryLight/20 flex items-center justify-center text-brand-primaryDark">
                  <Sparkles className="h-5 w-5 fill-brand-primaryDark" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-neutral-400">Featured Role</p>
                  <p className="text-xs font-bold text-neutral-900">Senior React Dev</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}