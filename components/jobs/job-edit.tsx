"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JobForm from "@/components/jobs/job-form";
import type { Job, JobCreate } from "@/lib/jobs/schema";

type JobEditProps = {
  id: string;
};

type FormValues = {
  title: string;
  description: string;
  location: string;
  salary_range: string;
  is_active: boolean;
};

export default function JobEdit({ id }: JobEditProps) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<FormValues | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <JobForm
      initialValues={initialValues}
      submitLabel="Save changes"
      onSubmit={handleSubmit}
    />
  );
}
