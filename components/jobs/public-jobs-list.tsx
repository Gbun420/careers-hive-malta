"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs/schema";
import { JobCard } from "@/components/ui/job-card";
import { Search, MapPin } from "lucide-react";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function PublicJobsList() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchBackend, setSearchBackend] = useState<"meili" | "db" | null>(
    null
  );

  const loadJobs = useCallback(async (pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const params = new URLSearchParams();
      if (query.trim().length > 0) {
        params.set("q", query.trim());
      }
      if (location.trim().length > 0) {
        params.set("location", location.trim());
      }
      params.set("is_active", "true");
      params.set("page", pageNum.toString());
      params.set("limit", "20");

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: Job[];
        source?: "meili" | "db";
        meta?: { search_backend?: "meili" | "db"; has_more?: boolean };
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      const newJobs = payload.data ?? [];
      setJobs((prev) => (isInitial ? newJobs : [...prev, ...newJobs]));
      setHasMore(payload.meta?.has_more ?? false);
      setSearchBackend(
        payload.source ?? payload.meta?.search_backend ?? null
      );
    } catch (err) {
      setError({
        error: {
          message: "Unable to load jobs.",
        },
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      void loadJobs(1, true);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, location, loadJobs]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void loadJobs(nextPage, false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-3xl border border-gold-200 bg-gold-50/50 p-8 text-center">
        <h3 className="text-lg font-bold text-navy-950">System Configuration Required</h3>
        <p className="mt-2 text-sm text-slate-600">
          Connect your database to view the live Malta job feed.
        </p>
        <Button asChild variant="outline" className="mt-6 border-gold-300">
          <Link href="/setup">Complete Setup</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search roles (e.g. Developer, Designer)"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-navy-950 focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400 transition-all"
          />
        </div>
        <div className="relative sm:w-1/3">
          <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Location (e.g. Valletta)"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium text-navy-950 focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-navy-400">
          {jobs.length} Opportunities Found
        </h2>
        {searchBackend === "meili" && (
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-600">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Search Active
          </div>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <p className="text-lg font-bold text-navy-950">No matching roles found.</p>
          <p className="mt-2 text-slate-500">Try adjusting your search or filters to find more opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              employerName={job.profiles?.email?.split('@')[0] || "Verified Employer"}
              location={job.location || "Malta"}
              salaryRange={job.salary_range}
              createdAt={job.created_at}
              isFeatured={job.is_featured}
              isVerified={job.employer_verified}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="mt-12 flex justify-center pb-10">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
            className="w-full sm:w-auto min-w-[200px] rounded-2xl font-black uppercase tracking-widest text-xs border-navy-200 hover:bg-navy-50"
          >
            {loadingMore ? "Synchronizing..." : "Load More Opportunities"}
          </Button>
        </div>
      )}
    </div>
  );
}