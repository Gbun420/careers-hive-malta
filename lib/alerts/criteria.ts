import { z } from "zod";

export const employmentTypes = [
  "full_time",
  "part_time",
  "contract",
  "internship",
] as const;

export const frequencies = ["instant", "daily", "weekly"] as const;

export const SavedSearchCriteriaSchema = z.object({
  keywords: z.string().optional(),
  location: z.string().optional(),
  categories: z.array(z.string()).optional(),
  employment_type: z.enum(employmentTypes).optional(),
  remote: z.boolean().optional(),
  salary_range: z.string().optional(),
});

export const SavedSearchSchema = z.object({
  id: z.string(),
  created_at: z.string(),
  frequency: z.enum(frequencies),
  search_criteria: SavedSearchCriteriaSchema,
});

export const SavedSearchCreateSchema = z.object({
  frequency: z.enum(frequencies),
  search_criteria: SavedSearchCriteriaSchema,
});

export const SavedSearchUpdateSchema = z.object({
  frequency: z.enum(frequencies).optional(),
  search_criteria: SavedSearchCriteriaSchema.optional(),
});

export type SavedSearchCriteria = z.infer<typeof SavedSearchCriteriaSchema>;
export type SavedSearch = z.infer<typeof SavedSearchSchema>;
export type SavedSearchCreate = z.infer<typeof SavedSearchCreateSchema>;
export type SavedSearchUpdate = z.infer<typeof SavedSearchUpdateSchema>;

const normalizeText = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export function buildCriteria(input: {
  keywords?: string;
  location?: string;
  categories?: string;
  employment_type?: string;
  remote?: boolean;
  salary_range?: string;
}): SavedSearchCriteria {
  const categories = input.categories
    ? input.categories
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : undefined;

  return SavedSearchCriteriaSchema.parse({
    keywords: normalizeText(input.keywords),
    location: normalizeText(input.location),
    categories: categories && categories.length > 0 ? categories : undefined,
    employment_type: input.employment_type || undefined,
    remote: input.remote || undefined,
    salary_range: normalizeText(input.salary_range),
  });
}
