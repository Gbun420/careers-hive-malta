"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/jobs/schema";
import ReportJobDialog from "@/components/jobs/report-job-dialog";
import { formatSalary } from "@/lib/jobs/format";
import { Badge } from "@/components/ui/badge";
import ApplyButton from "./apply-button";
import { MapPin, Euro, Calendar, Share2 } from "lucide-react";

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
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-32 rounded-3xl bg-slate-100" />
        <div className="h-64 rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (error?.error?.code === "SUPABASE_NOT_CONFIGURED") {
    return (
      <div className="rounded-3xl border border-gold-200 bg-gold-50/50 p-8 text-center">
        <h3 className="text-lg font-bold text-navy-950">System Configuration Required</h3>
        <p className="mt-2 text-sm text-slate-600">Connect your database to view the live Malta job feed.</p>
        <Button asChild variant="outline" className="mt-6 border-gold-300">
          <Link href="/setup">Complete Setup</Link>
        </Button>
      </div>
    );
  }

  if (error?.error?.message) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
        {error.error.message}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
        <p className="text-lg font-bold text-navy-950">Job not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="rounded-[2.5rem] border border-navy-100 bg-white p-8 shadow-premium lg:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {job.is_featured && <Badge variant="featured">Featured Priority</Badge>}
              {job.employer_verified && <Badge variant="verified">Verified Maltese Brand</Badge>}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight text-navy-950 lg:text-5xl">
                {job.title}
              </h1>
              <p className="text-xl font-bold text-navy-600">Verified Employer</p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-coral-500" />
                {job.location || "Malta"}
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-coral-500" />
                {formatSalary(job)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-coral-500" />
                Posted {new Date(job.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:w-full lg:w-auto">
            <ApplyButton jobId={job.id} jobTitle={job.title} />
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <ReportJobDialog jobId={job.id} />
              <Button variant="ghost" size="sm" className="text-navy-400 hover:text-navy-950 gap-2">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 lg:p-12">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-navy-400 mb-8">Role Description & Requirements</h2>
        <div className="prose prose-navy max-w-none prose-p:text-lg prose-p:leading-relaxed prose-p:text-slate-600 prose-p:font-medium">
          {(job.description || "").split("\n").map((line, index) => (
            <p key={`${job.id}-line-${index}`} className="mb-4">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
