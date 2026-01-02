"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/jobs", { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as ApiError & {
          data?: Job[];
        };

        if (!response.ok) {
          setError(payload);
          return;
        }

        setJobs(payload.data ?? []);
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

    void loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(query.toLowerCase())
  );

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

  if (filteredJobs.length === 0) {
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
        <Select disabled>
          <option>Filters coming soon</option>
        </Select>
      </div>
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200"
          >
            <p className="text-sm font-semibold text-slate-900">{job.title}</p>
            <p className="mt-1 text-xs text-slate-600">
              {job.location || "Remote/On-site"} · {job.salary_range || "Salary TBD"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
