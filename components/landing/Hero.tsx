"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Globe, Users, ArrowUpRight } from "lucide-react";

export default function Hero({ employerSignupHref }: { employerSignupHref: string }) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
      {/* Optimized Background Image */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
          alt="Premium Malta Business Landscape"
          fill
          priority
          quality={85}
          className="object-cover object-center scale-105 animate-slow-zoom"
          sizes="100vw"
        />
        {/* Readability & Branding Overlays */}
        <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-slate-50/50 via-transparent to-brand-slate-50" />
      </div>
      
      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-up">
          {/* Elite Status Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white shadow-premium border border-primary/10 mb-4 hover-scale cursor-default">
            <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest-plus text-primary/80">
              Malta&apos;s Premium Talent Exchange
            </span>
          </div>

          <h1 className="text-display-lg text-brand-navy leading-[0.95] tracking-tightest">
            The <span className="gradient-text font-black italic">Fastest</span> Path <br />
            To Maltese Excellence.
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Where elite Maltese brands meet high-performance professionals. 
            Powered by semantic AI matching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button asChild variant="primary" size="xl" className="group">
              <Link href="/signup">
                Join the Network <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>
            <Button asChild variant="tertiary" size="xl">
              <Link href="/jobs">
                Explore Intelligence <Zap className="h-4 w-4 text-brand-emerald-500" />
              </Link>
            </Button>
          </div>

          {/* Real-time Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-8 pt-16 md:pt-20 border-t border-slate-200/60 max-w-5xl mx-auto px-4 md:px-0">
            <div className="space-y-1 group">
              <div className="flex items-center justify-center gap-2 text-brand-navy transition-transform group-hover:scale-110">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xl md:text-2xl font-black tracking-tighter">100%</span>
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Vetted Brands</p>
            </div>
            <div className="space-y-1 group">
              <div className="flex items-center justify-center gap-2 text-brand-navy transition-transform group-hover:scale-110">
                <Zap className="h-5 w-5 text-brand-gold" />
                <span className="text-xl md:text-2xl font-black tracking-tighter">&lt; 2ms</span>
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Alert Latency</p>
            </div>
            <div className="space-y-1 group">
              <div className="flex items-center justify-center gap-2 text-brand-navy transition-transform group-hover:scale-110">
                <Globe className="h-5 w-5" />
                <span className="text-xl md:text-2xl font-black tracking-tighter">Local</span>
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Market Focus</p>
            </div>
            <div className="space-y-1 group">
              <div className="flex items-center justify-center gap-2 text-brand-navy transition-transform group-hover:scale-110">
                <Users className="h-5 w-5 text-brand-teal" />
                <span className="text-xl md:text-2xl font-black tracking-tighter">Verified</span>
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Talent Pool</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
