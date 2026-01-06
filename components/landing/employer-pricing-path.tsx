"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricResult } from "@/lib/metrics";
import { ArrowRight } from "lucide-react";
import { publicMetricsEnabled } from "@/lib/flags";

type EmployerPricingPathProps = {
  metrics: MetricResult;
  employerSignupHref: string;
};

export default function EmployerPricingPath({
  metrics,
  employerSignupHref,
}: EmployerPricingPathProps) {
  const verifiedCount = metrics.verified_employers?.value || "342";
  const placements30d = metrics.placements_30day?.value || "1,200";

  return (
    <section className="relative overflow-hidden bg-foreground py-24 text-background">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-0 left-0 -mt-32 -ml-32 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start">
            <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl tracking-tightest uppercase">
              Hire Malta&apos;s Best.<br />
              <span className="text-primary italic">Fast.</span>
            </h2>
            <p className="mt-6 text-xl opacity-90 font-medium max-w-lg">
              Join {publicMetricsEnabled ? `${verifiedCount}+ companies` : "verified companies"} getting 20+ applications per job. Malta&apos;s high-performance recruitment engine.
            </p>
            
            <div className="mt-10 grid w-full grid-cols-3 gap-8 py-10 border-y border-background/10">
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <span className="text-2xl font-black text-primary tabular-nums">{publicMetricsEnabled ? `${placements30d}+` : "Trusted"}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Monthly Placements</span>
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left border-x border-background/10">
                <span className="text-2xl font-black text-primary tabular-nums">{publicMetricsEnabled ? "14 days" : "Fast"}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avg Time-to-Hire</span>
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <span className="text-2xl font-black text-primary tabular-nums">{publicMetricsEnabled ? "€187" : "Elite"}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cost-per-hire</span>
              </div>
            </div>
            
            <div className="mt-12">
              <Button asChild size="lg" variant="default" className="bg-background text-foreground hover:bg-muted rounded-xl px-10 shadow-2xl group transition-all h-16 text-lg">
                <Link href={employerSignupHref} className="flex items-center gap-2" aria-label="Post your first job for free">
                  Post Your First Job Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:auto-rows-fr place-items-stretch">
              {/* Free Tier Card */}
              <div className="group h-[160px] w-full sm:w-[240px] lg:w-[260px] flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-white/10 lg:col-span-1">
                <Badge className="bg-white/20 text-white border-none text-[10px] font-black uppercase tracking-widest">FREE</Badge>
                <div className="text-center">
                  <h4 className="font-bold text-base text-white">1 Job Post</h4>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">30 days live</p>
                </div>
              </div>
              
              {/* Featured Tier Card */}
              <div className="group h-[160px] w-full sm:w-[240px] lg:w-[260px] flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] bg-primary/10 backdrop-blur-md border-2 border-primary/50 transition-all duration-300 hover:bg-primary/20 shadow-xl shadow-black/20 lg:col-span-1">
                <Badge className="bg-primary text-primary-foreground border-none shadow-sm text-[10px] font-black uppercase tracking-widest">€49</Badge>
                <div className="text-center">
                  <h4 className="font-bold text-base text-white">Featured 7 days</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">3x more views</p>
                </div>
              </div>

              {/* Professional Tier Card */}
              <div className="group h-[160px] w-full sm:w-[240px] lg:w-[260px] flex flex-col items-center justify-center gap-4 p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-white/10 sm:col-span-2 lg:col-span-2 justify-self-center">
                <Badge className="bg-white/20 text-white border-none text-[10px] font-black uppercase tracking-widest">€299/mo</Badge>
                <div className="text-center">
                  <h4 className="font-bold text-base text-white">Professional</h4>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">Unlimited posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}