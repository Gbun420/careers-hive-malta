"use client";

import { useEffect, useState } from "react";
import { JobCard } from "@/components/ui/job-card";
import { Sparkles, ArrowRight, Search, Target, TrendingUp, Zap, RefreshCw } from "lucide-react";
import Link from "next/link";
import { logPerformance } from "@/lib/logger";

interface JobWithMatch {
  id: string;
  title: string;
  location?: string;
  created_at: string;
  is_featured: boolean;
  matchScore?: number;
  salary_range?: string;
  skills_match?: string[];
  company_size?: string;
}

export default function EnhancedRecommendedJobs() {
  const [jobs, setJobs] = useState<JobWithMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [profileCompleteness, setProfileCompleteness] = useState(0);

  const loadMatches = async (isRefresh = false) => {
    const startTime = Date.now();

    try {
      if (isRefresh) setRefreshing(true);

      const [matchesResponse, profileResponse] = await Promise.all([
        fetch("/api/jobs/matches"),
        fetch("/api/profile"),
      ]);

      if (matchesResponse.ok) {
        const payload = await matchesResponse.json();
        setJobs(payload.data || []);
      }

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        setProfileCompleteness(profile.completeness || 0);
      }

      setLastUpdate(new Date());

      // Log performance
      logPerformance("/api/jobs/matches", Date.now() - startTime);
    } catch (err) {
      console.error("Failed to load matches", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadMatches();

    // Refresh every 5 minutes
    const interval = setInterval(() => void loadMatches(true), 300000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    void loadMatches(true);
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="h-6 w-6 animate-pulse rounded bg-slate-200" />
        </div>
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-44 w-full animate-pulse rounded-[2rem] bg-slate-100/50 outline outline-1 outline-slate-200/50"
          />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white/30 backdrop-blur-xl">
        <div className="p-8 space-y-8 bg-white/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-brand animate-pulse" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                AI-Powered Recommendations
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-medium text-slate-400">
                Profile: {profileCompleteness}% complete
              </span>
            </div>
          </div>

          <div className="p-16 text-center flex flex-col items-center gap-6">
            <div className="h-20 w-20 flex items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <Search className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                No matches yet.
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Complete your professional profile with skills and experience to unlock AI-powered
                job recommendations tailored to your career goals.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-brand" />
                  <span className="font-black text-slate-600">Better matching</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-secondary" />
                  <span className="font-black text-slate-600">Higher response rates</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="font-black text-slate-600">Instant alerts</span>
                </div>
              </div>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-brand/20 hover:bg-brand/90 hover-lift transition-all hover:scale-[1.05]"
            >
              Complete Profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/30 backdrop-blur-xl">
      <div className="p-8 space-y-8 bg-white/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-brand animate-pulse" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              AI-Powered Recommendations
            </h2>
            {jobs.length > 0 && (
              <span className="rounded-full bg-brand/10 px-2 py-1 text-[9px] font-black text-brand">
                {jobs.length} MATCHES
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Updated {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <JobCard
                id={job.id}
                title={job.title}
                employerName="Verified Partner"
                location={job.location || "Malta"}
                createdAt={job.created_at}
                isFeatured={job.is_featured}
                isVerified={true}
                matchScore={job.matchScore}
                salaryRange={job.salary_range}
              />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-200/50">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Showing {jobs.length} of 50+ Maltese opportunities
            </p>
            <Link
              href="/jobs"
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand hover:text-brand-accent transition-colors"
            >
              Explore All Jobs <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Clock component for the timestamp
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M12 6v6l4 2" />
    </svg>
  );
}
