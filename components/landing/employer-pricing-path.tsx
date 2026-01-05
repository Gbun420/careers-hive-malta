"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricResult } from "@/lib/metrics";
import { ArrowRight } from "lucide-react";

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
    <section className="relative overflow-hidden bg-brand-secondary py-24 text-white">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-0 left-0 -mt-32 -ml-32 h-[600px] w-[600px] rounded-full bg-brand-secondaryLight/10 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start">
            <h2 className="text-3xl font-bold leading-tight sm:text-lg lg:text-xl tracking-tightest">
              Hire Malta&apos;s Top Talent<br />
              <span className="bg-brand-primary bg-clip-text text-transparent italic">in Days</span>
            </h2>
            <p className="mt-6 text-base opacity-90 font-medium max-w-lg">
              Join {verifiedCount}+ companies getting 20+ applications per job. Malta&apos;s high-performance recruitment engine.
            </p>
            
            <div className="mt-10 grid w-full grid-cols-3 gap-8 py-10 border-y border-white/10">
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <span className="text-lg font-bold text-brand-primary">{placements30d}+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Monthly Placements</span>
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left border-x border-white/10">
                <span className="text-lg font-bold text-brand-primary">14 days</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Avg Time-to-Hire</span>
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <span className="text-lg font-bold text-brand-primary">€187</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cost-per-hire</span>
              </div>
            </div>
            
            <div className="mt-12">
              <Button asChild size="lg" variant="default" className="bg-white text-brand-secondary hover:bg-neutral-50 rounded-xl px-10 shadow-2xl group transition-all">
                <Link href={employerSignupHref} className="flex items-center gap-2">
                  Post Your First Job Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:items-end">
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-end">
              {/* Glassmorphism Tier Cards */}
              <div className="group w-44 flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-white/10">
                <Badge className="bg-white/20 text-white border-none text-[10px]">FREE</Badge>
                <div className="text-center">
                  <h4 className="font-bold text-sm">1 Job Post</h4>
                  <p className="text-[10px] font-medium opacity-60 uppercase mt-1">30 days live</p>
                </div>
              </div>
              
              <div className="hidden sm:block text-white/20 text-xl">→</div>

              <div className="group w-48 flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-brand-primary/10 backdrop-blur-md border-2 border-brand-primary/50 transition-all duration-300 scale-105 shadow-2xl shadow-black/20">
                <Badge className="bg-brand-primary text-white border-none shadow-sm text-[10px]">€49</Badge>
                <div className="text-center">
                  <h4 className="font-bold text-sm">Featured 7 days</h4>
                  <p className="text-[10px] font-bold text-brand-primary uppercase mt-1">3x more views</p>
                </div>
              </div>

              <div className="hidden sm:block text-white/20 text-xl">→</div>

              <div className="group w-44 flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 hover:bg-white/10">
                <Badge className="bg-brand-secondaryLight/30 text-white border-none text-[10px]">€299/mo</Badge>
                <div className="text-center">
                  <h4 className="font-bold text-sm">Professional</h4>
                  <p className="text-[10px] font-medium opacity-60 uppercase mt-1">Unlimited posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}