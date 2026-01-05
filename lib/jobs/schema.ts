import { z } from "zod";

export const JobSchema = z.object({
  id: z.string(),
  employer_id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable().optional(),
  salary_range: z.string().nullable().optional(), // Deprecated
  salary_min: z.number().nullable().optional(),
  salary_max: z.number().nullable().optional(),
  salary_period: z.enum(["hourly", "monthly", "yearly"]).optional(),
  currency: z.string().optional(),
  created_at: z.string(),
  is_active: z.boolean(),
  employer_verified: z.boolean().optional(),
  featured_until: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
});

export const JobCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters.")
    .max(4000, "Description must be 4000 characters or fewer."),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters.")
    .max(80, "Location must be 80 characters or fewer."),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  salary_period: z.enum(["hourly", "monthly", "yearly"]).default("yearly"),
  currency: z.string().default("EUR"),
  is_active: z.boolean().optional(),
});

export const JobUpdateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title must be 120 characters or fewer.")
    .optional(),
  description: z
    .string()
    .trim()
    .min(50, "Description must be at least 50 characters.")
    .max(4000, "Description must be 4000 characters or fewer.")
    .optional(),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters.")
    .max(80, "Location must be 80 characters or fewer.")
    .optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  salary_period: z.enum(["hourly", "monthly", "yearly"]).optional(),
  currency: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type Job = z.infer<typeof JobSchema>;
export type JobCreate = z.infer<typeof JobCreateSchema>;
export type JobUpdate = z.infer<typeof JobUpdateSchema>;

const normalizeText = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export function normalizeJobPayload(input: JobCreate | JobUpdate) {
  return {
    ...input,
    title: normalizeText(input.title),
    description: normalizeText(input.description),
    location: normalizeText(input.location),
    // salary_range is deprecated, logic moved to structured fields
  };
}
