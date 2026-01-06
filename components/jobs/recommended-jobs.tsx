"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/ui/job-card";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await fetch("/api/jobs/matches");
        if (response.ok) {
          const payload = await response.json();
          setJobs(payload.data || []);
        }
      } catch (err) {
        console.error("Failed to load matches", err);
      } finally {
        setLoading(false);
      }
    };

    void loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="text-sm font-bold text-navy-950">No personalized matches yet.</p>
        <p className="mt-2 text-xs text-slate-500">Update your profile skills to see roles that match your expertise.</p>
        <Link href="/profile" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-coral-500 hover:text-coral-600">
          Complete Profile <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-navy-950">
          <Sparkles className="h-4 w-4 text-gold-500 fill-gold-500" />
          <h3 className="text-sm font-black uppercase tracking-widest">Recommended for You</h3>
        </div>
        <Link href="/jobs" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-navy-950 transition-colors">
          View All Feed
        </Link>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            id={job.id}
            title={job.title}
            employerName="Verified Brand" // Simplifying for dashboard view
            location={job.location || "Malta"}
            createdAt={job.created_at}
            isFeatured={job.is_featured}
            matchScore={job.matchScore}
          />
        ))}
      </div>
    </div>
  );
}
