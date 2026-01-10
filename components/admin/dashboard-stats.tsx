"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ShieldCheck,
  AlertOctagon,
  Users,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { DataSparkline } from "./data-sparkline";

type MetricsData = {
  active_jobs: number;
  pending_employer_verifications: number;
  open_reports: number;
  total_users: number;
  trends: {
    jobs: { date: string; count: number }[];
    users: { date: string; count: number }[];
  };
};

export default function DashboardStats() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch("/api/admin/metrics");
        if (response.ok) {
          const payload = await response.json();
          setMetrics(payload.data);
        }
      } catch (error) {
        console.error("Failed to load metrics", error);
      } finally {
        setLoading(false);
      }
    };

    void loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-44 animate-pulse rounded-[2.5rem] bg-slate-100/50 outline outline-1 outline-slate-200/50" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    {
      title: "Active Jobs",
      value: metrics.active_jobs,
      icon: Briefcase,
      href: "/jobs",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      trend: metrics.trends.jobs,
      trendText: "+12% vs last week",
      isUp: true
    },
    {
      title: "Employer Verification",
      value: metrics.pending_employer_verifications,
      icon: ShieldCheck,
      href: "/admin/employers/verifications",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      trend: metrics.trends.users.filter((_, i) => i % 2 === 0), // Mocking variation
      trendText: "3 pending critical",
      isUp: false
    },
    {
      title: "Safety Reports",
      value: metrics.open_reports,
      icon: AlertOctagon,
      href: "/admin/reports",
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      trend: [], // No trend for reports for now
      trendText: "Response time: 4h",
      isUp: true
    },
    {
      title: "Total User Base",
      value: metrics.total_users,
      icon: Users,
      href: "/admin/profiles",
      color: "text-brand",
      bg: "bg-brand/10",
      trend: metrics.trends.users,
      trendText: "Steady growth",
      isUp: true
    }
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up">
      {cards.map(card => (
        <Link
          key={card.title}
          href={card.href}
          className="group glass-card hover-lift rounded-[2.5rem] p-8 border-border/40 flex flex-col justify-between min-h-[180px]"
        >
          <div className="flex items-start justify-between">
            <div className={`rounded-2xl p-3 ${card.bg} ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest ${card.isUp ? 'text-emerald-500' : 'text-slate-400'}`}>
                {card.trendText}
              </span>
              {card.isUp ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-slate-400" />}
            </div>
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {card.title}
              </p>
              <p className="mt-1 text-3xl font-black text-slate-950 tracking-tightest">
                {card.value}
              </p>
            </div>
            {card.trend && card.trend.length > 0 && (
              <div className="opacity-40 group-hover:opacity-100 transition-opacity translate-y-1">
                <DataSparkline data={card.trend} color={card.isUp ? "#10b981" : "#6366f1"} />
              </div>
            )}
          </div>
        </Link>
      ))}
    </section>
  );
}