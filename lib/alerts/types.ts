import { z } from "zod";

export const JobAlertFiltersSchema = z.object({
  location: z.string().optional(),
  sector: z.string().optional(),
  employmentType: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
});

export type JobAlertFilters = z.infer<typeof JobAlertFiltersSchema>;

export const JobAlertFrequencySchema = z.enum(["DAILY", "WEEKLY"]);
export type JobAlertFrequency = z.infer<typeof JobAlertFrequencySchema>;

export const JobAlertSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  query: z.string().nullable(),
  filters: JobAlertFiltersSchema,
  frequency: JobAlertFrequencySchema,
  enabled: z.boolean(),
  last_sent_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type JobAlert = z.infer<typeof JobAlertSchema>;

export const CreateJobAlertSchema = JobAlertSchema.pick({
  name: true,
  query: true,
  filters: true,
  frequency: true,
  enabled: true,
});

export type CreateJobAlert = z.infer<typeof CreateJobAlertSchema>;

export const UpdateJobAlertSchema = CreateJobAlertSchema.partial();
export type UpdateJobAlert = z.infer<typeof UpdateJobAlertSchema>;
