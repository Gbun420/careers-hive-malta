"use client";

import { useRouter } from "next/navigation";
import JobForm from "@/components/jobs/job-form";
import type { JobCreate } from "@/lib/jobs/schema";

export default function JobCreate() {
  const router = useRouter();

  const handleSubmit = async (payload: JobCreate) => {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? "Unable to create job.");
    }

    router.push("/employer/jobs");
  };

  return <JobForm submitLabel="Create job" onSubmit={handleSubmit} />;
}
