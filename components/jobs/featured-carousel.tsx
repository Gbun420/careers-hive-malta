"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Euro, Sparkles } from "lucide-react";
import type { Job } from "@/lib/jobs/schema";
import { formatSalary } from "@/lib/jobs/format";

export default function FeaturedCarousel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs/featured")
      .then((res) => res.json())
      .then((payload) => setJobs(payload.data ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-6 overflow-hidden px-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-80 flex-shrink-0 animate-pulse rounded-[2rem] bg-slate-100" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="w-full py-20 bg-slate-50/50 overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 mb-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-bold uppercase tracking-widest text-[10px] mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Featured Roles
          </div>
          <h2 className="text-4xl font-extrabold tracking-tightest">
            Hand-picked opportunities.
          </h2>
        </div>
        <Link href="/jobs" className="text-sm font-bold text-slate-950 hover:text-brand-600 transition-colors">
          View all jobs →
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto px-6 pb-10 scrollbar-hide snap-x snap-mandatory">
        {/* Visual offset for center alignment on large screens */}
        <div className="flex-shrink-0 w-[calc((100vw-72rem)/2)] hidden xl:block" />
        
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="snap-center premium-card flex-shrink-0 w-80 p-8 rounded-[2.5rem] bg-white group"
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {job.title}
                </h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    <MapPin className="h-3 w-3" />
                    {job.location || "Malta"}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    <Euro className="h-3 w-3" />
                    {formatSalary(job)}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">
                  {job.employer_verified ? "Verified" : "New Post"}
                </span>
                <div className="h-10 w-10 rounded-full bg-slate-950 flex items-center justify-center text-white group-hover:bg-brand-600 transition-colors">
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
        
        <div className="flex-shrink-0 w-[calc((100vw-72rem)/2)] hidden xl:block" />
      </div>
    </section>
  );
}
