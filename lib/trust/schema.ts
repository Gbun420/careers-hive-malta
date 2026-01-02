import { z } from "zod";

export const verificationStatuses = [
  "pending",
  "approved",
  "rejected",
] as const;

export const reportStatuses = [
  "new",
  "reviewing",
  "resolved",
  "dismissed",
] as const;

export const VerificationRequestSchema = z.object({
  notes: z.string().trim().optional(),
});

export const VerificationUpdateSchema = z.object({
  status: z.enum(verificationStatuses),
  notes: z.string().trim().optional(),
});

export const ReportCreateSchema = z.object({
  reason: z.string().trim().min(5, "Provide a brief reason."),
});

export const ReportUpdateSchema = z.object({
  status: z.enum(reportStatuses),
  resolution_notes: z.string().trim().optional(),
});

export type VerificationStatus = (typeof verificationStatuses)[number];
export type ReportStatus = (typeof reportStatuses)[number];

export type EmployerVerification = {
  id: string;
  employer_id: string;
  status: VerificationStatus;
  notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
};

export type JobReport = {
  id: string;
  job_id: string;
  reporter_id: string;
  status: ReportStatus;
  reason: string;
  resolution_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewer_id: string | null;
  job_title?: string | null;
};

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  meta: Record<string, unknown> | null;
  created_at: string;
};
