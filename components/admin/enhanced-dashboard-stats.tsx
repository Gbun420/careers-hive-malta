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
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Target,
} from "lucide-react";
import { DataSparkline } from "./data-sparkline";
import { logPerformance } from "@/lib/logger";

type MetricsData = {
  active_jobs: number;
  pending_employer_verifications: number;
  open_reports: number;
  total_users: number;
  conversion_rate: number;
  avg_response_time: number;
  trends: {
    jobs: { date: string; count: number }[];
    users: { date: string; count: number }[];
    applications: { date: string; count: number }[];
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
};

export default function DashboardStats() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const startTime = Date.now();

    const loadMetrics = async () => {
      try {
        const response = await fetch("/api/admin/metrics");
        if (response.ok) {
          const payload = await response.json();
          setMetrics(payload.data);
          setLastUpdate(new Date());

          // Log performance
          logPerformance("/api/admin/metrics", Date.now() - startTime);
        }
      } catch (error) {
        console.error("Failed to load metrics", error);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    void loadMetrics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-[2.5rem] bg-slate-100/50 outline outline-1 outline-slate-200/50"
          />
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
      isUp: true,
      badge:
        metrics.trends.jobs.length > 0 &&
        metrics.trends.jobs[metrics.trends.jobs.length - 1]?.count > 0,
    },
    {
      title: "Verification Queue",
      value: metrics.pending_employer_verifications,
      icon: ShieldCheck,
      href: "/admin/employers/verifications",
      color: metrics.pending_employer_verifications > 5 ? "text-rose-600" : "text-secondary",
      bg: metrics.pending_employer_verifications > 5 ? "bg-rose-500/10" : "bg-secondary/10",
      trend: metrics.trends.users.filter((_, i) => i % 2 === 0),
      trendText: metrics.pending_employer_verifications > 5 ? "Action required" : "On track",
      isUp: false,
      urgent: metrics.pending_employer_verifications > 10,
    },
    {
      title: "Safety Reports",
      value: metrics.open_reports,
      icon: AlertOctagon,
      href: "/admin/reports",
      color: "text-rose-600",
      bg: "bg-rose-500/10",
      trend: [],
      trendText: `Avg response: ${metrics.avg_response_time || 4}h`,
      isUp: true,
      critical: metrics.open_reports > 0,
    },
    {
      title: "Total Users",
      value: metrics.total_users,
      icon: Users,
      href: "/admin/profiles",
      color: "text-brand",
      bg: "bg-brand/10",
      trend: metrics.trends.users,
      trendText: `${metrics.conversion_rate || 15}% conversion`,
      isUp: true,
    },
  ];

  const systemHealth = (
    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
      <div className="flex items-center gap-1">
        <Activity className="h-3 w-3 text-secondary animate-pulse" />
        <span>Systems Online</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{lastUpdate.toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center gap-1">
        <Zap className="h-3 w-3 text-amber-500" />
        <span>Auto-refresh: 30s</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {systemHealth}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-fade-up">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`group glass-card hover-lift rounded-[2.5rem] p-8 border-border/40 flex flex-col justify-between min-h-[180px] relative ${
              card.critical
                ? "ring-2 ring-rose-200 bg-rose-50/20"
                : card.urgent
                  ? "ring-2 ring-amber-200 bg-amber-50/20"
                  : ""
            }`}
          >
            {card.critical && (
              <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-rose-500 animate-pulse" />
            )}

            <div className="flex items-start justify-between">
              <div className={`rounded-2xl p-3 ${card.bg} ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    card.isUp ? "text-secondary" : "text-slate-400"
                  }`}
                >
                  {card.trendText}
                </span>
                {card.badge && <Target className="h-3 w-3 text-secondary" />}
                {card.isUp ? (
                  <TrendingUp className="h-3 w-3 text-secondary" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-slate-400" />
                )}
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
    </div>
  );
}
