import "server-only";

import { renderDigestEmail, renderJobAlertEmail } from "@/lib/email/templates/job-alert";
import type { Job } from "@/lib/jobs/schema";

export type EmailSendResult =
  | { ok: true }
  | { ok: false; code: "EMAIL_NOT_CONFIGURED" | "EMAIL_FAILED"; message: string };

type JobAlertPayload = {
  job: Job;
  to: string;
};

type DigestPayload = {
  to: string;
  jobs: Job[];
  frequency: "daily" | "weekly";
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "Careers Hive Malta <onboarding@resend.dev>";

export function isEmailConfigured() {
  return Boolean(resendApiKey);
}

async function sendEmail(to: string, subject: string, html: string): Promise<EmailSendResult> {
  if (!resendApiKey) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      message: "Resend is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      ok: false,
      code: "EMAIL_FAILED",
      message: errorText || "Failed to send email.",
    };
  }

  return { ok: true };
}

export async function sendJobAlertEmail(payload: JobAlertPayload): Promise<EmailSendResult> {
  const { subject, html } = renderJobAlertEmail({
    job: payload.job,
    baseUrl,
  });
  return sendEmail(payload.to, subject, html);
}

export async function sendDigestEmail(payload: DigestPayload): Promise<EmailSendResult> {
  const { subject, html } = renderDigestEmail({
    baseUrl,
    jobs: payload.jobs,
    frequency: payload.frequency,
  });
  return sendEmail(payload.to, subject, html);
}
