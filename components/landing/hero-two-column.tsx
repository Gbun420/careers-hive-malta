"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, ShieldCheck, Zap } from "lucide-react";
import { MetricResult } from "@/lib/metrics";
import { publicMetricsEnabled } from "@/lib/flags";

type HeroProps = {
  metrics: MetricResult;
};

export default function HeroTwoColumn({ metrics }: HeroProps) {
  const activeSeekers = publicMetricsEnabled ? (metrics.active_job_seekers?.value || "5,000+") : "Thousands of";
  const totalJobs = publicMetricsEnabled ? (metrics.total_job_postings?.value || "1,000+") : "Live Feed";
  const verifiedEmployers = publicMetricsEnabled ? (metrics.verified_employers?.value || "300+") : "Verified Brands";

  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left">
            <Badge variant="new" className="mb-6 px-4 py-1 text-xs uppercase tracking-widest">
              Malta&apos;s High-Performance Feed
            </Badge>
            
            <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-navy-950 sm:text-6xl lg:text-7xl">
              ALERT.<br />
              MATCH.<br />
              <span className="text-coral-500">HIRE.</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg font-medium leading-relaxed text-slate-600">
              The premium job board for the Maltese market. Get real-time alerts from <span className="text-navy-950 font-bold">{publicMetricsEnabled ? `${verifiedEmployers} verified employers` : "Verified Employers"}</span> delivered with zero latency.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-coral-500 hover:bg-coral-600 text-white font-black rounded-2xl h-14 px-8 shadow-lg shadow-coral-500/20">
                <Link href="/signup">Create Free Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-navy-200 text-navy-950 font-black rounded-2xl h-14 px-8 hover:bg-navy-50 transition-all">
                <Link href="/jobs">Browse Opportunities</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-navy-50/50 blur-3xl rounded-[3rem] -z-10" />
            <div className="rounded-[2.5rem] border border-navy-100 bg-white p-8 shadow-premium lg:p-10">
              <div className="mb-10 flex items-center justify-between border-b border-navy-50 pb-6">
                <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-navy-100" />
                  <div className="h-3 w-3 rounded-full bg-navy-100" />
                  <div className="h-3 w-3 rounded-full bg-navy-100" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  System Live
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Professionals</div>
                    <div className="text-4xl font-black tabular-nums tracking-tight text-navy-950">{activeSeekers}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral-50 text-coral-600">
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Maltese Opportunities</div>
                    <div className="text-4xl font-black tabular-nums tracking-tight text-navy-950">{totalJobs}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Brands</div>
                    <div className="text-4xl font-black tabular-nums tracking-tight text-navy-950">{verifiedEmployers}</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl bg-navy-950 p-5 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy-400">
                    Alert Latency
                  </div>
                  <Zap className="h-4 w-4 text-gold-400 fill-gold-400" />
                </div>
                <div className="text-2xl font-black tabular-nums italic">
                  {publicMetricsEnabled ? `< ${metrics.alert_delivery_time?.value || "5"} Minutes` : "Real-time Alerts"}
                </div>
                <p className="mt-1 text-[10px] font-medium text-navy-300">
                  {publicMetricsEnabled ? "Real-time synchronization across Malta network" : "Instant synchronization for Maltese roles"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
