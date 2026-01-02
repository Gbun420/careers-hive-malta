"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs/schema";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

export default function EmployerJobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [billingEnabled, setBillingEnabled] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [featureLoadingId, setFeatureLoadingId] = useState<string | null>(null);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/jobs?mine=true", {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: Job[];
        meta?: { billing_enabled?: boolean };
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      setJobs(payload.data ?? []);
      setBillingEnabled(Boolean(payload.meta?.billing_enabled));
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

  useEffect(() => {
    void loadJobs();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this job? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as ApiError;
      setError(payload);
      return;
    }

    await loadJobs();
  };

  const handleFeature = async (id: string) => {
    if (!billingEnabled) {
      setBillingError("Billing is not configured.");
      return;
    }

    setBillingError(null);
    setFeatureLoadingId(id);
    try {
      const response = await fetch("/api/billing/checkout-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: id }),
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        url?: string;
      };

      if (!response.ok) {
        setBillingError(
          payload.error?.message ?? "Unable to start checkout."
        );
        return;
      }

      if (payload.url) {
        window.location.href = payload.url;
      }
    } finally {
      setFeatureLoadingId(null);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-600">Loading jobs...</p>;
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Connect Supabase to manage jobs. <Link href="/setup" className="underline">Go to setup</Link>.
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
        <p className="text-sm text-slate-600">No job posts yet.</p>
        <Button asChild className="mt-4">
          <Link href="/employer/jobs/new">Create your first job</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {billingError ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {billingError}
        </p>
      ) : null}
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{job.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {job.is_active ? "Active" : "Draft"} · {job.location || "No location"}
              </p>
              {job.is_featured && job.featured_until ? (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  Featured until{" "}
                  {new Date(job.featured_until).toLocaleDateString()}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href={`/employer/jobs/${job.id}/edit`}>Edit</Link>
              </Button>
              <Button
                variant="outline"
                disabled={!billingEnabled || job.is_featured || featureLoadingId === job.id}
                title={
                  !billingEnabled
                    ? "Billing not configured"
                    : job.is_featured
                    ? "Job is already featured"
                    : undefined
                }
                onClick={() => handleFeature(job.id)}
              >
                {featureLoadingId === job.id ? "Redirecting..." : "Feature"}
              </Button>
              <Button variant="outline" onClick={() => handleDelete(job.id)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
