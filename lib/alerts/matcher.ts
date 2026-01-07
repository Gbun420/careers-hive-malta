import { SupabaseClient } from "@supabase/supabase-js";
import { JobAlertFilters } from "./types";

export async function fetchMatchingJobs(
  supabase: SupabaseClient,
  query: string | null,
  filters: JobAlertFilters,
  since: Date
) {
  let dbQuery = supabase
    .from("jobs")
    .select("id, title, description, location, company_name, salary_range, salary_min, salary_max, created_at")
    .eq("is_active", true)
    .gt("posted_at", since.toISOString());

  if (query) {
    // Basic text search. 
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }
  
  if (filters.location) {
    dbQuery = dbQuery.ilike("location", `%${filters.location}%`);
  }

  if (filters.employmentType) {
    dbQuery = dbQuery.eq("employment_type", filters.employmentType);
  }

  if (filters.salaryMin) {
    dbQuery = dbQuery.gte("salary_max", filters.salaryMin);
  }

  // Note: sector matching depends on your jobs table schema. 
  // Assuming a 'category' or 'industry' column if available.
  // For now, if sector is provided, we skip it unless we confirm column name.

  const { data, error } = await dbQuery.limit(50).order("posted_at", { ascending: false });
  
  if (error) {
      console.error("Match error", error);
      return [];
  }
  return data || [];
}