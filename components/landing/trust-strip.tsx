"use client";

import { ShieldCheck, Zap, Users, TrendingUp } from "lucide-react";

const STATS = [
  {
    label: "Employer Trust",
    value: "100%",
    sub: "Vetted Brands",
    icon: ShieldCheck,
    color: "text-primary"
  },
  {
    label: "System Speed",
    value: "< 2ms",
    sub: "Alert Latency",
    icon: Zap,
    color: "text-secondary"
  },
  {
    label: "Market Reach",
    value: "Global",
    sub: "Top 1% Talent",
    icon: Users,
    color: "text-brand-violet"
  },
  {
    label: "Placements",
    value: "Active",
    sub: "Q1 Momentum",
    icon: TrendingUp,
    color: "text-primary"
  }
];

export default function TrustStrip() {
  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
          {STATS.map((stat, i) => (
            <div 
              key={stat.label} 
              className="flex items-center gap-3 md:gap-5 group animate-fade-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={cn(
                "h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center bg-slate-50 transition-all duration-500 group-hover:scale-110 shrink-0",
                stat.color
              )}>
                <stat.icon className="h-5 w-5 md:h-7 md:w-7" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
                  {stat.label}
                </p>
                <p className="text-xl md:text-2xl font-black text-brand-navy tracking-tightest truncate">
                  {stat.value}
                </p>
                <p className="text-[8px] md:text-[10px] font-bold text-slate-400 truncate">
                  {stat.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
