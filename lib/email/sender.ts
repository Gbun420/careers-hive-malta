import "server-only";

import { renderDigestEmail, renderJobAlertEmail } from "@/lib/email/templates/job-alert";
import { renderEmployerMessageEmail } from "@/lib/email/templates/employer-message";
import type { Job } from "@/lib/jobs/schema";

export type EmailSendResult =
  | { ok: true; id?: string }
  | { ok: false; code: "EMAIL_NOT_CONFIGURED" | "EMAIL_FAILED"; message: string };

type JobAlertPayload = {
  job: Job;
  to: string;
};

type DigestPayload = {
  to: string;
  jobs: Job[];
  frequency: "daily" | "weekly";
  unsubscribeUrl?: string;
};

type EmployerMessagePayload = {
  to: string;
  candidateName?: string | null;
  employerName: string;
  companyName?: string | null;
  jobTitle: string;
  messageBody: string;
  ctaUrl: string;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "Careers.mt <onboarding@resend.dev>";
const recipientOverride = process.env.EMAIL_RECIPIENT_OVERRIDE;

export function isEmailConfigured() {
  return Boolean(resendApiKey);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<EmailSendResult> {
  if (!resendApiKey) {
    return {
      ok: false,
      code: "EMAIL_NOT_CONFIGURED",
      message: "Resend is not configured.",
    };
  }

  // Use override if present (for testing with unverified Resend domains)
  const finalTo = recipientOverride || to;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFrom,
      to: finalTo,
      subject: recipientOverride ? `[OVERRIDE to ${to}] ${subject}` : subject,
      html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      code: "EMAIL_FAILED",
      message: data.message || "Failed to send email.",
    };
  }

  return { ok: true, id: data.id };
}

export async function sendConfirmationEmail(payload: { to: string; confirmationUrl: string }): Promise<EmailSendResult> {
  const subject = "Confirm your account - Careers.mt";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #0d748c;">Welcome to Careers.mt!</h1>
      <p>Please confirm your account to start managing your job alerts and postings.</p>
      <div style="margin: 32px 0;">
        <a href="${payload.confirmationUrl}" style="background-color: #0d748c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-weight: bold;">
          Confirm Email Address
        </a>
      </div>
      <p style="color: #64748b; font-size: 14px;">
        If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      <p style="color: #94a3b8; font-size: 12px;">
        Careers.mt
      </p>
    </div>
  `;
  return sendEmail(payload.to, subject, html);
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
    unsubscribeUrl: payload.unsubscribeUrl,
  });
  return sendEmail(payload.to, subject, html);
}

export async function sendEmployerMessageEmail(payload: EmployerMessagePayload): Promise<EmailSendResult> {
  const { subject, html } = renderEmployerMessageEmail(payload);
  return sendEmail(payload.to, subject, html);
}

