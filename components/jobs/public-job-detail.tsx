"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/lib/jobs/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type PublicJobDetailProps = {
  id: string;
};

export default function PublicJobDetail({ id }: PublicJobDetailProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
        const payload = (await response.json().catch(() => ({}))) as ApiError & {
          data?: Job;
        };

        if (!response.ok) {
          setError(payload);
          return;
        }

        setJob(payload.data ?? null);
      } catch (err) {
        setError({
          error: {
            message: "Unable to load job.",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    void loadJob();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading job details...</p>;
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Job details are unavailable. Connect Supabase to view listings. {" "}
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

  if (!job) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
        <p className="text-sm text-slate-600">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{job.title}</p>
      <p className="mt-1 text-xs text-slate-600">
        {job.location || "Remote/On-site"} · {job.salary_range || "Salary TBD"}
      </p>
      <div className="mt-4 space-y-3 text-sm text-slate-700">
        {job.description.split("\n").map((line, index) => (
          <p key={`${job.id}-line-${index}`}>{line}</p>
        ))}
      </div>
    </div>
  );
}
