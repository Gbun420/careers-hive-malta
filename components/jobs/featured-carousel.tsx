"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { Job } from "@/lib/jobs/schema";
import { JobCard } from "@/components/ui/job-card";

export default function FeaturedCarousel() {
  const [jobs, setJobs] = useState<any[]>([]);
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
      <div className="flex gap-6 overflow-hidden px-6 py-20">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 w-80 flex-shrink-0 animate-pulse rounded-[2.5rem] bg-slate-100" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) return null;

  return (
    <section className="w-full py-24 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-gold-600 font-black uppercase tracking-widest text-[10px] mb-4">
            <Sparkles className="h-3.5 w-3.5 fill-gold-500" />
            Premium Placement
          </div>
          <h2 className="text-4xl font-black tracking-tight text-navy-950 sm:text-5xl">
            Featured Opportunities.
          </h2>
        </div>
        <Link href="/jobs" className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-navy-400 hover:text-navy-950 transition-colors">
          View all active roles <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="flex gap-6 overflow-x-auto px-6 pb-12 scrollbar-hide snap-x snap-mandatory">
        {/* Padding for center alignment */}
        <div className="flex-shrink-0 w-[calc((100vw-80rem)/2)] hidden 2xl:block" />
        
        {jobs.map((job) => (
          <div key={job.id} className="snap-center flex-shrink-0 w-80 sm:w-96">
            <JobCard 
              id={job.id}
              title={job.title}
              employerName={job.profiles?.email?.split('@')[0] || "Verified Employer"}
              location={job.location || "Malta"}
              salaryRange={job.salary_range}
              createdAt={job.created_at}
              isFeatured={true}
              isVerified={job.employer_verified}
            />
          </div>
        ))}
        
        <div className="flex-shrink-0 w-[calc((100vw-80rem)/2)] hidden 2xl:block" />
      </div>
    </section>
  );
}