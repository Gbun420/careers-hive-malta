"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StatsData = {
  jobs: {
    total: number;
    active: number;
  };
  verifications: {
    pending: number;
  };
  reports: {
    pending: number;
  };
  users: {
    total: number;
  };
};

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const payload = await response.json();
          setStats(payload.data);
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-slate-100"></div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Active Jobs</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {stats.jobs.active}
          <span className="ml-2 text-sm font-normal text-slate-400">
            / {stats.jobs.total} total
          </span>
        </p>
      </div>
      <Link 
        href="/admin/verifications"
        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30"
      >
        <p className="text-sm font-medium text-slate-500 group-hover:text-teal-600">
          Pending Verifications
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {stats.verifications.pending}
        </p>
      </Link>
      <Link 
        href="/admin/reports"
        className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500/30"
      >
        <p className="text-sm font-medium text-slate-500 group-hover:text-teal-600">
          Pending Reports
        </p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {stats.reports.pending}
        </p>
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Total Users</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">
          {stats.users.total}
        </p>
      </div>
    </section>
  );
}
