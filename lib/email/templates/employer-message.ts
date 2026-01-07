import { BRAND_NAME } from "@/lib/brand";

type EmployerMessageTemplateProps = {
  candidateName?: string | null;
  employerName: string;
  companyName?: string | null;
  jobTitle: string;
  messageBody: string;
  ctaUrl: string;
};

export function renderEmployerMessageEmail({
  candidateName,
  employerName,
  companyName,
  jobTitle,
  messageBody,
  ctaUrl,
}: EmployerMessageTemplateProps) {
  const subject = `New message regarding your ${jobTitle} application`;
  const senderName = companyName || employerName;
  const previewText = messageBody.substring(0, 180) + (messageBody.length > 180 ? "..." : "");

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <h1 style="color: #0d748c; font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.025em;">
        New Message from ${senderName}
      </h1>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        Hi ${candidateName || "there"},
      </p>
      <p style="font-size: 16px; line-height: 1.6; color: #475569;">
        You have received a new message regarding your application for <strong>${jobTitle}</strong>.
      </p>
      
      <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 16px; border-left: 4px solid #0d748c;">
        <p style="margin: 0; font-size: 15px; color: #334155; font-style: italic;">
          "${messageBody}"
        </p>
      </div>

      <div style="margin: 32px 0;">
        <a href="${ctaUrl}" style="display: inline-block; background-color: #0d748c; color: white; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          View Message & Reply
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">
        You are receiving this because you applied for a role on ${BRAND_NAME}. 
        To manage your notifications, log in to your dashboard.
      </p>
    </div>
  `;

  return { subject, html, text: `${subject}\n\n${previewText}\n\nView here: ${ctaUrl}` };
}
