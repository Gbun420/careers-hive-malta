"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Bell, Sparkles } from "lucide-react";
import PricingSteps from "./PricingSteps";

type EmployerPricingPathProps = {
  employerSignupHref: string;
};

export default function EmployerPricingPath({
  employerSignupHref,
}: EmployerPricingPathProps) {
  return (
    <section className="relative overflow-hidden bg-foreground py-24 text-background">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      <div className="absolute top-0 left-0 -mt-32 -ml-32 h-[600px] w-[600px] rounded-full bg-brand/10 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start">
            <h2 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl tracking-tightest uppercase">
              Hire Malta&apos;s Best.<br />
              <span className="text-brand-accent italic">Fast.</span>
            </h2>
            <p className="mt-6 text-xl opacity-90 font-medium max-w-lg">
              Malta&apos;s high-performance recruitment engine. Connect with verified talent delivered with zero latency.
            </p>
            
            <div className="mt-10 flex flex-col gap-6 py-10 border-y border-background/10 w-full">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Verified employers only</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand-accent">
                  <Bell className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Real-time job alerts</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand-accent">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="text-lg font-bold">Quality-first moderation</span>
              </div>
            </div>
            
            <div className="mt-12">
              <Button asChild size="lg" variant="default" className="bg-background text-foreground hover:bg-muted rounded-xl px-10 shadow-cta transition-all h-16 text-lg border-none">
                <Link href={employerSignupHref} className="flex items-center gap-2" aria-label="Post your first job for free">
                  Post Your First Job Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end w-full">
            <PricingSteps />
          </div>
        </div>
      </div>
    </section>
  );
}
