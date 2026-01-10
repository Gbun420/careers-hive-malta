"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs/schema";
import ReportJobDialog from "@/components/jobs/report-job-dialog";
import { formatSalary } from "@/lib/jobs/format";
import { Badge } from "@/components/ui/badge";
import ApplyButton from "./apply-button";
import { MapPin, Euro, Calendar, Share2, ExternalLink } from "lucide-react";
import { SafeExternalLink } from "@/components/common/SafeExternalLink";

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
        
        // Track View
        if (payload.data) {
          fetch(`/api/jobs/${id}/track`, {
            method: "POST",
            body: JSON.stringify({ type: "view" }),
          }).catch(() => {}); // Fire and forget
        }

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

  const handleExternalApply = () => {
    fetch(`/api/jobs/${id}/track`, {
      method: "POST",
      body: JSON.stringify({ type: "click" }),
    }).catch(() => {});
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 rounded-3xl bg-muted" />
        <div className="h-64 rounded-3xl bg-muted" />
      </div>
    );
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-3xl border border-brand/20 bg-muted/50 p-8 text-center">
        <h3 className="text-xl font-black text-foreground uppercase tracking-tightest">System Configuration Required</h3>
        <p className="mt-2 text-sm font-bold text-muted-foreground">Connect your database to view the live Malta job feed.</p>
        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline" className="border-brand/50">
            <Link href="/setup">Complete Setup</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (error?.error?.message) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-bold text-destructive">
        {error.error.message}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-border bg-card px-6 py-16 text-center">
        <p className="text-lg font-black text-foreground uppercase tracking-tightest">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-md lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {job.is_featured && <Badge variant="featured">Featured Priority</Badge>}
              {job.employer_verified && <Badge variant="verified">Verified Maltese Brand</Badge>}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tightest text-foreground lg:text-6xl uppercase leading-tight">
                {job.title}
              </h1>
              <p className="text-xl font-bold text-brand">Verified Employer</p>
            </div>

            <div className="flex flex-wrap gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand" />
                {job.location || "Malta"}
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-brand" />
                {formatSalary(job)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:w-full lg:w-auto">
            {job.is_aggregated && job.apply_url ? (
              <Button asChild size="lg" className="rounded-xl px-10 bg-brand text-white border-none shadow-cta h-12 gap-2" onClick={handleExternalApply}>
                <SafeExternalLink href={job.apply_url}>
                  Apply on company site
                  <ExternalLink className="h-4 w-4" />
                </SafeExternalLink>
              </Button>
            ) : (
              <ApplyButton jobId={job.id} jobTitle={job.title} />
            )}
            
            {job.is_aggregated && (
              <p className="text-[10px] text-slate-400 font-medium italic text-center">
                This role is listed from an external source.
              </p>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
              <ReportJobDialog jobId={job.id} />
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-border bg-card p-8 lg:p-12">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Role Description & Requirements</h2>
        <div className="prose prose-neutral max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground prose-p:font-medium">
          {(job.description || "").split("\n").map((line, index) => (
            <p key={`${job.id}-line-${index}`} className="mb-4">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}