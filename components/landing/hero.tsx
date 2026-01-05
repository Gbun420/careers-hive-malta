"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroProps = {
  employerSignupHref: string;
};

type Stats = {
  totalJobs: number;
  verifiedEmployers: number;
  activeJobseekers: number;
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
    <section className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-2 py-1 rounded border border-brand-100 bg-brand-50 text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Live Malta Job Feed
            </div>
            
            <h1 className="text-6xl font-black leading-[0.9] tracking-tightest text-slate-950 sm:text-7xl lg:text-8xl animate-fade-in">
              ALERT.<br />MATCH.<br /><span className="text-brand-600 uppercase">HIRE.</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg font-medium leading-relaxed text-slate-500 animate-fade-in">
              {stats ? (
                <>Join <span className="text-brand-600 font-bold">{stats.activeJobseekers}</span> professionals and browse <span className="text-brand-600 font-bold">{stats.totalJobs}</span> live roles from verified Malta employers.</>
              ) : (
                "The high-performance job board for Malta. Real-time alerts from verified employers delivered with zero latency."
              )}
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-in">
              <Button asChild size="lg" className="rounded-lg h-12 px-8">
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-lg h-12 px-8">
                <Link href="/jobs">View Active Roles</Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="absolute inset-0 bg-brand-500/5 blur-3xl rounded-full" />
            <div className="relative border border-slate-200 bg-white p-8 rounded-2xl shadow-premium">
              <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">System Monitor</div>
              </div>
              
              <div className="space-y-6">
                {stats ? (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Active Database Entries</span>
                        <span className="text-brand-600">Live</span>
                      </div>
                      <div className="text-4xl font-black tabular-nums tracking-tighter text-slate-950">{stats.totalJobs}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Verified Maltese Brands</span>
                        <span className="text-brand-600">Verified</span>
                      </div>
                      <div className="text-4xl font-black tabular-nums tracking-tighter text-slate-950">{stats.verifiedEmployers}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Synced Jobseekers</span>
                        <span className="text-brand-600">Synced</span>
                      </div>
                      <div className="text-4xl font-black tabular-nums tracking-tighter text-slate-950">{stats.activeJobseekers}</div>
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-slate-300 font-mono text-xs italic">Initializing Data Stream...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}