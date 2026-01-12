"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowUpRight, ShieldCheck, Globe, Users, TrendingUp } from "lucide-react";

export default function Hero({ employerSignupHref }: { employerSignupHref: string }) {
  return (
    <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-secondary/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="container-wide relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            The Talent Network for Malta&apos;s Elite
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-primary leading-[0.9] tracking-tightest">
              Hire <span className="text-secondary italic">Brilliant</span> <br />
              Maltese Talent.
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed font-body">
              Join the Hive. A high-performance ecosystem connecting verified brands 
              with the top 1% of Malta&apos;s professional network.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Button asChild size="xl" className="group bg-secondary text-primary hover:bg-secondary/90 border-none px-8 py-8 text-lg font-black rounded-2xl shadow-cta hover:shadow-cta-hover transition-all">
              <Link href="/signup">
                Get Access Now <ArrowUpRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-2 border-primary/10 hover:border-primary/20 bg-white/50 backdrop-blur-sm px-8 py-8 text-lg font-bold rounded-2xl transition-all">
              <Link href="/jobs">
                Explore The Feed
              </Link>
            </Button>
          </div>

          {/* Value Bento Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-20 max-w-4xl mx-auto">
            <div className="hive-border p-6 rounded-3xl space-y-3 hover-lift">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="text-2xl font-black text-primary tracking-tightest">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vetted Brands</p>
              </div>
            </div>
            <div className="hive-border p-6 rounded-3xl space-y-3 hover-lift">
              <Zap className="h-6 w-6 text-secondary" />
              <div className="text-left">
                <p className="text-2xl font-black text-primary tracking-tightest">&lt; 1ms</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match Speed</p>
              </div>
            </div>
            <div className="hive-border p-6 rounded-3xl space-y-3 hover-lift">
              <Globe className="h-6 w-6 text-brand-violet" />
              <div className="text-left">
                <p className="text-2xl font-black text-primary tracking-tightest">Local</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First-Party</p>
              </div>
            </div>
            <div className="hive-border p-6 rounded-3xl space-y-3 hover-lift">
              <TrendingUp className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="text-2xl font-black text-primary tracking-tightest">Active</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Placements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}