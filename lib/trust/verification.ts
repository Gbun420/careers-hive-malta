import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Job } from "@/lib/jobs/schema";

export async function isEmployerVerified(employerId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("employer_verifications")
    .select("employer_id")
    .eq("employer_id", employerId)
    .eq("status", "approved")
    .limit(1)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function attachEmployerVerified(jobs: Job[]): Promise<Job[]> {
  if (jobs.length === 0) {
    return jobs;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jobs;
  }

  const employerIds = Array.from(
    new Set(jobs.map((job) => job.employer_id))
  );

  const { data, error } = await supabase
    .from("employer_verifications")
    .select("employer_id")
    .in("employer_id", employerIds)
    .eq("status", "approved");

  if (error) {
    return jobs;
  }

  const verified = new Set((data ?? []).map((row) => row.employer_id));
  return jobs.map((job) => ({
    ...job,
    employer_verified: verified.has(job.employer_id),
  }));
}
