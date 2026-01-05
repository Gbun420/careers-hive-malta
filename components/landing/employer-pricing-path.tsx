"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { MetricResult } from "@/lib/metrics";

type EmployerPricingPathProps = {
  metrics: MetricResult;
  employerSignupHref: string;
};

export default function EmployerPricingPath({
  metrics,
  employerSignupHref,
}: EmployerPricingPathProps) {
  const adoptionRate = metrics.featured_adoption_rate?.value;
  const avgApps = metrics.avg_applications_per_job?.value;

  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Employer Value Prop */}
          <div className="flex flex-col justify-center rounded-[3rem] bg-navy-950 p-10 text-white lg:p-16">
            <Badge variant="verified" className="w-fit mb-6 border-navy-700 bg-navy-900/50 text-navy-200">
              For Maltese Employers
            </Badge>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Hire Faster with <span className="text-coral-400">Verified</span> Authority.
            </h2>
            <p className="mt-6 text-xl text-navy-200 leading-relaxed font-medium">
              Join the network of verified businesses hiring top-tier talent in Malta. Feature your roles to stand out from the noise.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-coral-500 hover:bg-coral-600 text-white font-black rounded-2xl h-14 px-8">
                <Link href={employerSignupHref}>Post a Job Now</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 font-bold rounded-2xl h-14 px-8">
                <Link href="/employer/verification" className="flex items-center gap-2">
                  Request Verification <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Pricing/Featured Preview */}
          <div className="rounded-[3rem] border border-slate-200 bg-white p-10 lg:p-16 shadow-premium">
            <div className="flex items-center justify-between mb-8">
              <Badge variant="featured" className="px-4 py-1 uppercase tracking-widest text-[10px]">Premium Feature</Badge>
              {adoptionRate && adoptionRate !== 0 && (
                <span className="text-xs font-black text-navy-600 uppercase tracking-widest">
                  {adoptionRate}% of Employers Upgrade
                </span>
              )}
            </div>

            <h3 className="text-3xl font-black text-navy-950">Boost Visibility.</h3>
            <p className="mt-4 text-lg font-medium text-slate-500">
              One-time featured upgrades to lock your roles at the top of the feed for maximum candidate flow.
            </p>

            <ul className="mt-10 space-y-6">
              {[
                "Priority placement in industry search results",
                `Attract up to ${avgApps || "12+"} candidates per role`,
                "Premium 'Featured' badge for trust",
                "Direct link to external application tracking"
              ].map((item) => (
                <li key={item} className="flex items-start gap-4 text-navy-950 font-bold">
                  <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-100 text-gold-600">
                    <Check className="h-3 w-3 stroke-[4]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-12 border-t border-slate-100 pt-8">
              <Link href="/pricing" className="group text-sm font-black uppercase tracking-[0.2em] text-navy-400 hover:text-navy-950 transition-colors flex items-center gap-2">
                View Pricing Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
