import type { Job } from "@/lib/jobs/schema";

type JobAlertTemplateProps = {
  job: Job;
  baseUrl: string;
};

export function renderJobAlertEmail({ job, baseUrl }: JobAlertTemplateProps) {
  const jobUrl = `${baseUrl}/jobs/${job.id}`;
  const manageUrl = `${baseUrl}/jobseeker/alerts`;

  return {
    subject: `New match: ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">${job.title}</h2>
        <p style="margin: 0 0 8px;">${job.location ?? "Remote/On-site"} · ${job.salary_range ?? "Salary TBD"}</p>
        <p style="margin: 0 0 16px;">${job.description}</p>
        <a href="${jobUrl}" style="display: inline-block; padding: 10px 16px; background: #0d748c; color: #fff; text-decoration: none; border-radius: 999px;">View job</a>
        <p style="margin-top: 16px; font-size: 12px; color: #64748b;">
          Manage alerts: <a href="${manageUrl}">Saved searches</a>
        </p>
      </div>
    `,
  };
}

type DigestTemplateProps = {
  baseUrl: string;
  jobs: Job[];
  frequency: "daily" | "weekly";
};

export function renderDigestEmail({ baseUrl, jobs, frequency }: DigestTemplateProps) {
  const manageUrl = `${baseUrl}/jobseeker/alerts`;
  const items = jobs
    .map(
      (job) =>
        `<li><a href="${baseUrl}/jobs/${job.id}">${job.title}</a> · ${
          job.location ?? "Remote/On-site"
        }</li>`
    )
    .join("");

  return {
    subject: `${frequency === "daily" ? "Daily" : "Weekly"} job digest`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Your ${
          frequency === "daily" ? "daily" : "weekly"
        } job digest</h2>
        <ul style="padding-left: 18px; margin: 0 0 16px;">
          ${items}
        </ul>
        <p style="margin-top: 16px; font-size: 12px; color: #64748b;">
          Manage alerts: <a href="${manageUrl}">Saved searches</a>
        </p>
      </div>
    `,
  };
}
