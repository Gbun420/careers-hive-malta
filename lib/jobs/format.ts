import type { Job } from "@/lib/jobs/schema";

export function formatSalary(job: Job): string {
  if (job.salary_min && job.salary_max) {
    if (job.salary_min === job.salary_max) {
        return `€${job.salary_min.toLocaleString()} / ${job.salary_period}`;
    }
    return `€${job.salary_min.toLocaleString()} - €${job.salary_max.toLocaleString()} / ${job.salary_period}`;
  }
  if (job.salary_min) {
    return `From €${job.salary_min.toLocaleString()} / ${job.salary_period}`;
  }
  if (job.salary_max) {
    return `Up to €${job.salary_max.toLocaleString()} / ${job.salary_period}`;
  }
  return job.salary_range || "Salary TBD";
}
