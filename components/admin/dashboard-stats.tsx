"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  ShieldCheck,
  AlertOctagon,
  Users,
  ArrowRight
} from "lucide-react";

type MetricsData = {
  active_jobs: number;
  pending_employer_verifications: number;
  open_reports: number;
  total_users: number;
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
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
      bg: "bg-blue-50"
    },
    {
      title: "Pending Verifications",
      value: metrics.pending_employer_verifications,
      icon: ShieldCheck,
      href: "/admin/employers/verifications",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Open Reports",
      value: metrics.open_reports,
      icon: AlertOctagon,
      href: "/admin/reports",
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      title: "Total Users",
      value: metrics.total_users,
      icon: Users,
      href: "/admin/profiles",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => (
        <Link
          key={card.title}
          href={card.href}
          className="group glass-card hover-glow rounded-[2rem] p-6 transition-all hover:scale-[1.02] active:scale-[0.98] border-border/50"
        >
          <div className="flex items-start justify-between">
            <div className={`rounded-2xl p-3 ${card.bg} ${card.color} shadow-sm group-hover:shadow-md transition-all`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div className="rounded-xl bg-slate-50 p-2 text-slate-300 transition-all group-hover:bg-brand group-hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {card.title}
            </p>
            <p className="mt-1 text-3xl font-black text-slate-950 tracking-tightest">
              {card.value}
            </p>
          </div>
        </Link>
      ))}
    </section>
  );
}