"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, TrendingUp, ArrowRight } from "lucide-react";

export default function EmployerHero() {
  return (
    <section className="relative overflow-hidden bg-background py-16 lg:py-24 border-b">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center rounded-full border border-brand/20 bg-brand/5 px-4 py-1 text-xs font-bold uppercase tracking-widest text-brand mb-6">
              Employer Command Center
            </div>
            
            <h1 className="text-5xl font-black leading-[1.1] tracking-tightest text-foreground sm:text-6xl lg:text-7xl uppercase">
              ALERT.<br />
              MATCH.<br />
              <span className="text-brand">HIRE.</span>
            </h1>
            
            <p className="mt-8 max-w-lg text-lg font-medium leading-relaxed text-muted-foreground">
              The premium job board for the Maltese market. Connect with verified talent delivered with zero latency.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg" className="rounded-2xl h-14 px-8 shadow-cta transition-all bg-brand text-white border-none">
                <Link href="/signup?role=employer">Create Employer Account</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-2xl h-14 px-8 border-2 border-brand/20 hover:bg-brand/5 text-brand">
                <Link href="/jobs">View Public Feed</Link>
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-brand/5 blur-[80px] rounded-[3rem] pointer-events-none group-hover:bg-brand/10 transition-colors duration-500" />
            <div className="relative border border-border bg-card p-8 rounded-[2.5rem] shadow-2xl lg:p-10">
              <div className="space-y-8 text-foreground">
                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification</div>
                    <div className="text-xl font-bold text-foreground italic">Trust-First Platform</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                    <Zap className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Performance</div>
                    <div className="text-xl font-bold text-foreground italic">Zero-Latency Alerts</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Optimization</div>
                    <div className="text-xl font-bold text-foreground italic">High-Performance Feed</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 rounded-2xl bg-foreground p-5 text-background">
                <div className="flex items-center justify-between mb-2 text-background/60">
                  <div className="text-[10px] font-black uppercase tracking-widest">
                    Market Latency
                  </div>
                  <Zap className="h-4 w-4 fill-brand text-brand" />
                </div>
                <div className="text-2xl font-black italic">
                  Instant Sync
                </div>
                <p className="mt-1 text-[10px] font-medium text-background/40">
                  Real-time synchronization across Malta network
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
