"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { Job } from "@/lib/jobs/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function PublicJobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [searchBackend, setSearchBackend] = useState<"meili" | "db" | null>(
    null
  );

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
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

        const response = await fetch(`/api/jobs?${params.toString()}`, {
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as ApiError & {
          data?: Job[];
          source?: "meili" | "db";
          meta?: { search_backend?: "meili" | "db" };
        };

        if (!response.ok) {
          setError(payload);
          return;
        }

        setJobs(payload.data ?? []);
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
      }
    };

    const timer = setTimeout(() => {
      void loadJobs();
    }, 200);

    return () => clearTimeout(timer);
  }, [query, location]);

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
          placeholder="Search roles"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Input
          placeholder="Filter by location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>
      {searchBackend === "meili" ? (
        <p className="text-xs text-slate-500">
          Search powered by fast index.
        </p>
      ) : null}
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{job.title}</p>
              {job.is_featured ? (
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                  Featured
                </span>
              ) : null}
              {job.employer_verified ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Verified
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {job.location || "Remote/On-site"} · {job.salary_range || "Salary TBD"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
