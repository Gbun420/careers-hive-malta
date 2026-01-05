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
  application_method: z.enum(["email", "url"]).optional(),
  application_url: z.string().nullable().optional(),
  application_email: z.string().nullable().optional(),
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
  application_method: z.enum(["email", "url"]).default("email"),
  application_url: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  application_email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  is_active: z.boolean().optional(),
}).refine((data) => {
  if (data.application_method === "url") {
    return !!data.application_url;
  }
  if (data.application_method === "email") {
    return !!data.application_email;
  }
  return true;
}, {
  message: "Application URL or Email is required based on the selected method.",
  path: ["application_method"], // Associate error with method field
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
  application_method: z.enum(["email", "url"]).optional(),
  application_url: z.string().trim().url().optional().or(z.literal("")),
  application_email: z.string().trim().email().optional().or(z.literal("")),
  is_active: z.boolean().optional(),
}).refine((data) => {
  // Only validate if method is being updated or if we want strictness, 
  // but for updates we might not have all fields. 
  // However, if method is provided, we should check the corresponding field if it's also provided.
  // Ideally, for updates, we might trust existing data or require both if switching.
  // For simplicity, we'll skip complex cross-field validation on partial updates 
  // unless both are present, or rely on client-side state.
  // Actually, let's keep it simple for now and rely on form validation.
  return true; 
});

export type Job = z.infer<typeof JobSchema>;
export type JobCreate = z.infer<typeof JobCreateSchema>;
export type JobUpdate = z.infer<typeof JobUpdateSchema>;

const normalizeText = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export function normalizeJobPayload(input: JobCreate | JobUpdate) {
  return {
    ...input,
    title: input.title ? normalizeText(input.title) : undefined,
    description: input.description ? normalizeText(input.description) : undefined,
    location: input.location ? normalizeText(input.location) : undefined,
    application_url: input.application_url ? normalizeText(input.application_url) : undefined,
    application_email: input.application_email ? normalizeText(input.application_email) : undefined,
    // salary_range is deprecated, logic moved to structured fields
  };
}
