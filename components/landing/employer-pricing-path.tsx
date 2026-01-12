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
    <section className="relative overflow-hidden bg-primary py-32 text-white">
      {/* Abstract Hive Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute bottom-0 right-0 -mb-32 -mr-32 h-[800px] w-[800px] rounded-full bg-secondary/10 blur-[150px]" />
      
      <div className="container-wide relative z-10">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tightest">
                The Network <br />
                For <span className="text-secondary italic">Builders.</span>
              </h2>
              <p className="text-xl text-slate-300 font-medium max-w-lg leading-relaxed">
                Stop shouting into the void. Access a pre-vetted pool of Malta&apos;s 
                most ambitious professionals in one high-performance dashboard.
              </p>
            </div>
            
            <div className="grid gap-6 py-10 border-y border-white/10">
              <div className="flex items-center gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary transition-transform group-hover:scale-110">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="block text-lg font-black uppercase tracking-widest text-white">Verified Companies Only</span>
                  <span className="block text-sm text-slate-400">We manually vet every employer to maintain trust.</span>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary transition-transform group-hover:scale-110">
                  <Bell className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="block text-lg font-black uppercase tracking-widest text-white">Zero Latency Alerts</span>
                  <span className="block text-sm text-slate-400">Candidates get notified within seconds of your post.</span>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-secondary transition-transform group-hover:scale-110">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="block text-lg font-black uppercase tracking-widest text-white">AI-Powered Shortlists</span>
                  <span className="block text-sm text-slate-400">Our engine finds the best matches so you don&apos;t have to.</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="xl" className="bg-secondary text-primary hover:bg-secondary/90 rounded-2xl px-12 h-20 text-lg font-black shadow-cta">
                <Link href={employerSignupHref}>
                  Join The Network <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center lg:items-end w-full lg:pl-12">
            <PricingSteps />
          </div>
        </div>
      </div>
    </section>
  );
}