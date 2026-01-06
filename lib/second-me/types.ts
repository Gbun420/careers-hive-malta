import { z } from "zod";

export const GenerationTypeSchema = z.enum([
  "FIT_SUMMARY",
  "BULLETS",
  "COVER_LETTER",
  "INTERVIEW_PREP",
]);

export type GenerationType = z.infer<typeof GenerationTypeSchema>;

export const SecondMeSettingsSchema = z.object({
  user_id: z.string().uuid(),
  enabled: z.boolean(),
  consent_at: z.string().nullable(),
  tone: z.string().nullable(),
  language: z.string(),
});

export type SecondMeSettings = z.infer<typeof SecondMeSettingsSchema>;

export const GenerateRequestSchema = z.object({
  jobId: z.string().uuid(),
  type: GenerationTypeSchema,
  overrides: z.record(z.any()).optional(),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// Output shapes per type
export const FitSummaryOutputSchema = z.object({
  headline: z.string(),
  match_points: z.array(z.string()),
  risks: z.array(z.string()),
  suggested_next_steps: z.array(z.string()),
});

export const BulletsOutputSchema = z.object({
  bullets: z.array(z.string()),
});

export const CoverLetterOutputSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

export const InterviewPrepOutputSchema = z.object({
  questions: z.array(z.object({
    q: z.string(),
    why: z.string(),
    star_prompt: z.string(),
  })),
});

export const OutputSchemas = {
  FIT_SUMMARY: FitSummaryOutputSchema,
  BULLETS: BulletsOutputSchema,
  COVER_LETTER: CoverLetterOutputSchema,
  INTERVIEW_PREP: InterviewPrepOutputSchema,
};
