"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs/schema";
import FeatureCTA from "@/components/billing/feature-cta";
import { X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type EmployerJobListProps = {
  billingEnabled: boolean;
  featuredDurationDays: number;
  featuredPriceLabel: string | null;
  showPricePlaceholderWarning?: boolean;
};

export default function EmployerJobList({
  billingEnabled: billingEnabledDefault,
  featuredDurationDays,
  featuredPriceLabel,
  showPricePlaceholderWarning = false,
}: EmployerJobListProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [billingEnabled, setBillingEnabled] = useState(
    billingEnabledDefault
  );

  const loadJobs = async (pageNum: number, isInitial: boolean) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const response = await fetch(`/api/jobs?mine=true&page=${pageNum}&limit=20`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as ApiError & {
        data?: Job[];
        meta?: { billing_enabled?: boolean; has_more?: boolean };
      };

      if (!response.ok) {
        setError(payload);
        return;
      }

      const newJobs = payload.data ?? [];
      setJobs((prev) => (isInitial ? newJobs : [...prev, ...newJobs]));
      setHasMore(payload.meta?.has_more ?? false);
      if (typeof payload.meta?.billing_enabled === "boolean") {
        setBillingEnabled(payload.meta.billing_enabled);
      }
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
  };

  useEffect(() => {
    void loadJobs(1, true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    void loadJobs(nextPage, false);
  };

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

    await loadJobs(1, true);
  };

  const createdJobId = searchParams.get("jobId");
  const showCreatedBanner =
    searchParams.get("created") === "1" && Boolean(createdJobId);
  const createdJob = createdJobId
    ? jobs.find((job) => job.id === createdJobId)
    : null;
  const handleDismissBanner = () => {
    router.replace("/employer/jobs");
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
      {showPricePlaceholderWarning ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Stripe price ID is a placeholder; checkout will fail in this environment.
        </div>
      ) : null}
      {showCreatedBanner ? (
        <div className="rounded-[2rem] border border-gold-200 bg-gold-50 p-8 shadow-premium mb-8 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={handleDismissBanner} className="text-gold-400 hover:text-gold-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-gold-600 shadow-sm flex-shrink-0">
              <Sparkles className="h-8 w-8 fill-gold-500" />
            </div>
            <div className="flex-grow">
              <Badge variant="featured" className="mb-2">Priority Post Successfully Live</Badge>
              <h3 className="text-2xl font-black text-navy-950">Reach 3x more candidates.</h3>
              <p className="mt-2 text-sm font-medium text-gold-800 leading-relaxed max-w-xl">
                Featured listings stay at the top of the feed and search results for {featuredDurationDays} days. 
                Average roles get 18+ matching applicants within 48 hours.
              </p>
            </div>
            <div className="flex-shrink-0">
              {createdJob && !createdJob.is_featured ? (
                <FeatureCTA
                  jobId={createdJob.id}
                  billingEnabled={billingEnabled}
                  label={featuredPriceLabel ? `Boost Now (${featuredPriceLabel})` : "Boost Now"}
                  size="lg"
                  className="w-full sm:w-auto"
                  redirectPath="/employer/jobs"
                />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
      {jobs.map((job) => (
        <div
          key={job.id}
          className="premium-card p-6 rounded-[2rem] bg-white shadow-sm border border-slate-200/60"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xl font-bold text-slate-950 tracking-tightest">{job.title}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className={job.is_active ? "text-emerald-600" : "text-amber-600"}>
                  {job.is_active ? "Active" : "Draft"}
                </span>
                <span>·</span>
                <span>{job.location || "No location"}</span>
              </div>
              {job.is_featured && job.featured_until ? (
                <p className="mt-2 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                  ★ Featured until{" "}
                  {new Date(job.featured_until).toLocaleDateString()}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild className="rounded-xl">
                <Link href={`/employer/jobs/${job.id}/edit`}>Edit</Link>
              </Button>
              {!job.is_featured ? (
                <FeatureCTA
                  jobId={job.id}
                  billingEnabled={billingEnabled}
                  label={
                    featuredPriceLabel
                      ? `Boost (${featuredPriceLabel})`
                      : "Boost"
                  }
                  className="rounded-xl px-4"
                  redirectPath="/employer/jobs"
                />
              ) : null}
              <Button variant="outline" onClick={() => handleDelete(job.id)} className="rounded-xl text-rose-600 border-rose-100 hover:bg-rose-50 hover:border-rose-200">
                Delete
              </Button>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="mt-8 flex justify-center pb-10">
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
