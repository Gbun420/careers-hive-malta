"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JobForm from "@/components/jobs/job-form";
import type { Job, JobCreate } from "@/lib/jobs/schema";
import FeatureCTA from "@/components/billing/feature-cta";

type JobEditProps = {
  id: string;
  billingEnabled: boolean;
  featuredDurationDays: number;
  featuredPriceLabel: string | null;
};

type FormValues = {
  title: string;
  description: string;
  location: string;
  salary_range: string;
  is_active: boolean;
};

export default function JobEdit({
  id,
  billingEnabled,
  featuredDurationDays,
  featuredPriceLabel,
}: JobEditProps) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      const response = await fetch(`/api/jobs/${id}`, { cache: "no-store" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.error?.message ?? "Unable to load job.");
        return;
      }
      const data: { data: Job } = await response.json();
      const job = data.data;
      setJob(job);
      setInitialValues({
        title: job.title,
        description: job.description,
        location: job.location ?? "",
        salary_range: job.salary_range ?? "",
        is_active: job.is_active,
      });
    };

    void loadJob();
  }, [id]);

  const handleSubmit = async (payload: JobCreate) => {
    const response = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? "Unable to update job.");
    }

    router.push("/employer/jobs");
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!initialValues) {
    return <p className="text-sm text-slate-600">Loading job...</p>;
  }

  return (
    <div className="space-y-10">
      <JobForm
        initialValues={initialValues}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Feature this job
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Top placement for {featuredDurationDays} days, plus a featured badge
          and priority placement in search.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>• Featured badge in listings</li>
          <li>• Appears first in search results</li>
          <li>• Highlighted for active jobseekers</li>
        </ul>
        {job?.employer_verified ? (
          <p className="mt-3 text-xs text-emerald-700">
            Verified employers stand out to jobseekers.
          </p>
        ) : null}
        {job?.is_featured && job.featured_until ? (
          <p className="mt-4 text-sm font-semibold text-emerald-700">
            Featured until {new Date(job.featured_until).toLocaleDateString()}
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <FeatureCTA
              jobId={id}
              billingEnabled={billingEnabled}
              label={
                featuredPriceLabel
                  ? `Feature for ${featuredPriceLabel}`
                  : "Feature this job"
              }
              size="lg"
              redirectPath={`/employer/jobs/${id}/edit`}
            />
            <span className="text-xs text-slate-500">
              {billingEnabled
                ? "Stripe checkout opens in a new page."
                : "Billing coming soon."}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
