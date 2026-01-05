import { createServiceRoleClient } from "@/lib/supabase/server";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus, sortFeaturedJobs } from "@/lib/billing/featured";
import type { Job } from "@/lib/jobs/schema";

export async function getJobs(params: {
  q?: string;
  location?: string;
  salary_min?: number;
  verified_only?: boolean;
  page?: number;
  limit?: number;
} = {}) {
  const supabase = createServiceRoleClient();
  const { q, location, salary_min, verified_only, page = 1, limit = 20 } = params;
  
  if (!supabase) return { 
    data: [], 
    meta: { total: 0, page, limit, has_more: false } 
  };

  const offset = (page - 1) * limit;

  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  if (location) {
    query = query.ilike("location", `%${location}%`);
  }
  
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }

  if (salary_min) {
    query = query.gte("salary_min", salary_min);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("DB Error fetching jobs:", error);
    return { 
      data: [], 
      meta: { total: 0, page, limit, has_more: false } 
    };
  }

  const rawJobs = data || [];
  const withFeatured = await attachFeaturedStatus(rawJobs as Job[]);
  const enriched = await attachEmployerVerified(withFeatured);
  
  let finalJobs = enriched;
  if (verified_only) {
    finalJobs = enriched.filter(j => j.employer_verified);
  }

  const sorted = sortFeaturedJobs(finalJobs);

  return {
    data: sorted,
    meta: {
      total: count || 0,
      page,
      limit,
      has_more: count ? (offset + rawJobs.length < count) : false
    }
  };
}