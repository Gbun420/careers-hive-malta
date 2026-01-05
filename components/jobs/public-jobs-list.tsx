"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs/schema";
import { formatSalary } from "@/lib/jobs/format";
import { MapPin, Euro, Briefcase } from "lucide-react";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function PublicJobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
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
    return <p className="text-sm text-slate-600">Loading jobs...</p>;
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Jobs are unavailable. Connect Supabase to load listings. {" "}
        <Link href="/setup" className="underline">Go to setup</Link>.
      </div>
    );
  }

  if (error?.error?.message) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error.error.message}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-slate-600">
          No jobs found yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <Input
          placeholder="Search roles (e.g. Developer, Designer)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Input
          placeholder="Location (e.g. Valletta)"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>
      {searchBackend === "meili" ? (
        <p className="text-xs text-slate-500 font-medium">
          ⚡ Search results updated instantly.
        </p>
      ) : null}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="premium-card group block p-6 rounded-3xl"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-950 tracking-tightest group-hover:text-brand-600 transition-colors">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-5 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {job.location || "Malta"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Euro className="h-3.5 w-3.5 text-slate-400" />
                    {formatSalary(job)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {job.is_featured ? (
                  <span className="rounded-xl bg-amber-100/50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-700 border border-amber-200">
                    Featured
                  </span>
                ) : null}
                {job.employer_verified ? (
                  <span className="rounded-xl bg-slate-950 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white border border-slate-950 shadow-lg shadow-slate-200">
                    Verified
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center pb-10">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            {loadingMore ? "Loading more..." : "Load more jobs"}
          </Button>
        </div>
      )}
    </div>
  );
}
