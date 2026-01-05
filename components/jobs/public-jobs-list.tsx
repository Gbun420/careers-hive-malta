"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
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
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-brand-300 hover:shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {job.location || "Remote/On-site"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Euro className="h-4 w-4 text-slate-400" />
                    {formatSalary(job)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {job.is_featured ? (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-200">
                    Featured
                  </span>
                ) : null}
                {job.employer_verified ? (
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-200">
                    Verified
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
