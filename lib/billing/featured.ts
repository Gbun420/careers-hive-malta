import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/jobs/schema";

export type JobWithFeatured = Job & {
  is_featured?: boolean;
  featured_until?: string | null;
};

export function isJobFeatured(job: JobWithFeatured, now = new Date()): boolean {
  if (typeof job.is_featured === "boolean") {
    return job.is_featured;
  }
  if (!job.featured_until) {
    return false;
  }
  return new Date(job.featured_until).getTime() > now.getTime();
}

export async function attachFeaturedStatus(
  jobs: Job[]
): Promise<JobWithFeatured[]> {
  if (jobs.length === 0) {
    return jobs;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jobs.map((job) => ({
      ...job,
      is_featured: false,
      featured_until: null,
    }));
  }

  const jobIds = Array.from(new Set(jobs.map((job) => job.id)));
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("job_featured")
    .select("job_id, featured_until, featured_tier")
    .in("job_id", jobIds)
    .gt("featured_until", nowIso);

  if (error) {
    return jobs.map((job) => ({
      ...job,
      is_featured: false,
      featured_until: null,
    }));
  }

  const featuredMap = new Map(
    (data ?? []).map((row) => [row.job_id, row])
  );

  return jobs.map((job) => {
    const featured = featuredMap.get(job.id);
    return {
      ...job,
      is_featured: Boolean(featured),
      featured_until: featured?.featured_until ?? null,
    };
  });
}

export function sortFeaturedJobs<T extends JobWithFeatured>(jobs: T[]): T[] {
  return [...jobs].sort((a, b) => {
    const aFeatured = isJobFeatured(a);
    const bFeatured = isJobFeatured(b);
    if (aFeatured !== bFeatured) {
      return aFeatured ? -1 : 1;
    }
    const aTime = new Date(a.created_at).getTime();
    const bTime = new Date(b.created_at).getTime();
    return bTime - aTime;
  });
}
