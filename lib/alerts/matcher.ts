import { SupabaseClient } from "@supabase/supabase-js";

export async function fetchMatchingJobs(
  supabase: SupabaseClient,
  query: string | null,
  filters: any,
  since: Date
) {
  let dbQuery = supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .gt("posted_at", since.toISOString());

  if (query) {
    // Basic text search. Real app might use full text search column
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }
  
  if (filters?.location) {
    dbQuery = dbQuery.ilike("location", `%${filters.location}%`);
  }

  const { data, error } = await dbQuery;
  if (error) {
      console.error("Match error", error);
      return [];
  }
  return data || [];
}
