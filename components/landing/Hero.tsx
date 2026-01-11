"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Globe, Users, ArrowUpRight } from "lucide-react";

export default function Hero({ employerSignupHref }: { employerSignupHref: string }) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden bg-[#F8FAFC]">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      
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
            <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-brand-navy text-white hover:bg-primary shadow-premium group btn-premium">
              <Link href="/signup" className="flex items-center gap-3 text-base font-black uppercase tracking-widest">
                Join the Network <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary bg-white/50 backdrop-blur-sm text-base font-black uppercase tracking-widest">
              <Link href="/jobs">Explore Intelligence</Link>
            </Button>
          </div>

          {/* Real-time Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-slate-200/60 max-w-5xl mx-auto">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-brand-navy">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-2xl font-black tracking-tighter">100%</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vetted Brands</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-brand-navy">
                <Zap className="h-5 w-5 text-secondary" />
                <span className="text-2xl font-black tracking-tighter">&lt; 2ms</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alert Latency</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-brand-navy">
                <Globe className="h-5 w-5" />
                <span className="text-2xl font-black tracking-tighter">Local</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Market Focus</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 text-brand-navy">
                <Users className="h-5 w-5 text-brand-teal" />
                <span className="text-2xl font-black tracking-tighter">Verified</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Talent Pool</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
