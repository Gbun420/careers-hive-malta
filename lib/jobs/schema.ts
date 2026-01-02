import { z } from "zod";

export const JobSchema = z.object({
  id: z.string(),
  employer_id: z.string(),
  title: z.string(),
  description: z.string(),
  location: z.string().nullable().optional(),
  salary_range: z.string().nullable().optional(),
  created_at: z.string(),
  is_active: z.boolean(),
});

export const JobCreateSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().min(1, "Description is required."),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const JobUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
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
    salary_range: normalizeText(input.salary_range),
  };
}
