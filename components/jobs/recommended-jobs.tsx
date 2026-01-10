"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/ui/job-card";
import { Sparkles, ArrowRight, Search } from "lucide-react";
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
      <div className="p-8 space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-44 w-full animate-pulse rounded-[2rem] bg-slate-100/50 outline outline-1 outline-slate-200/50" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="p-16 text-center flex flex-col items-center gap-6">
        <div className="h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 text-slate-300">
          <Search className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">No matches yet.</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Update your professional skills and headline to unlock AI-powered job recommendations.
          </p>
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-brand/20 hover:bg-brand/90 hover-lift transition-all"
        >
          Optimize Profile <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/30 backdrop-blur-xl">
      <div className="p-8 space-y-8 bg-white/40">
        <div className="grid gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              employerName="Verified Partner"
              location={job.location || "Malta"}
              createdAt={job.created_at}
              isFeatured={job.is_featured}
              matchScore={job.matchScore}
            />
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200/50 text-center">
          <Link href="/jobs" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-brand transition-colors">
            Explore 50+ More Maltese Roles →
          </Link>
        </div>
      </div>
    </div>
  );
}
