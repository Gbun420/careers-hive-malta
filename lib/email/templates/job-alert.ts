import type { Job } from "@/lib/jobs/schema";

type JobAlertTemplateProps = {
  job: Job;
  baseUrl: string;
};

export function renderJobAlertEmail({ job, baseUrl }: JobAlertTemplateProps) {
  const jobUrl = `${baseUrl}/job/${job.id}`;
  const manageUrl = `${baseUrl}/jobseeker/alerts`;
  const locationDisplay = job.office_region ? `${job.location ?? "Malta"} (${job.office_region})` : (job.location ?? "Remote/On-site");

  return {
    subject: `New match: ${job.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">${job.title}</h2>
        <p style="margin: 0 0 8px;">${locationDisplay} · ${job.salary_range ?? "Salary TBD"}</p>
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
  unsubscribeUrl?: string;
};

export function renderDigestEmail({ baseUrl, jobs, frequency, unsubscribeUrl }: DigestTemplateProps) {
  const manageUrl = `${baseUrl}/jobseeker/alerts`;
  const items = jobs
    .map(
      (job) =>
        `<li><a href="${baseUrl}/job/${job.id}">${job.title}</a> · ${
          job.office_region ? `${job.location ?? "Malta"} (${job.office_region})` : (job.location ?? "Remote/On-site")
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
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
          <p>
            Manage alerts: <a href="${manageUrl}">Saved searches</a>
            ${unsubscribeUrl ? ` · <a href="${unsubscribeUrl}">Unsubscribe from this alert</a>` : ""}
          </p>
        </div>
      </div>
    `,
  };
}
