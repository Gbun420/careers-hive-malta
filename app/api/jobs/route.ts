import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { JobCreateSchema, normalizeJobPayload } from "@/lib/jobs/schema";
import { upsertJobs } from "@/lib/search/meili";
import type { Job } from "@/lib/jobs/schema";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus, sortFeaturedJobs, type JobWithFeatured } from "@/lib/billing/featured";
import { matchJobToSearch } from "@/lib/alerts/match";
import type { SavedSearchCriteria } from "@/lib/alerts/criteria";
import { logAudit } from "@/lib/audit/log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";
  const query = searchParams.get("q");
  const location = searchParams.get("location");

  if (mine) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return jsonError("UNAUTHORIZED", "Authentication required.", 401);
    }
    const role = getUserRole(authData.user);
    if (role !== "employer" && role !== "admin") {
      return jsonError("FORBIDDEN", "Employer or Admin access required.", 403);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("employer_id", authData.user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
         return jsonError("DB_ERROR", error.message, 500);
    }

    // Attach details even for "mine" list (e.g. to show featured status)
    const withFeatured = await attachFeaturedStatus(data as Job[]);
    const enriched = await attachEmployerVerified(withFeatured);
    
    return NextResponse.json({ 
        data: enriched, 
        meta: { billing_enabled: false } 
    });
  }

  // Public search
  const limitParam = Number(searchParams.get("limit") ?? "20");
  const pageParam = Number(searchParams.get("page") ?? "1");
  const limit = Math.min(Math.max(1, limitParam), 100);
  const offset = (Math.max(1, pageParam) - 1) * limit;

  let dbQuery = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (location) {
    dbQuery = dbQuery.ilike("location", `%${location}%`);
  }
  
  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data, error, count } = await dbQuery;

    if (error) {
         return jsonError("DB_ERROR", error.message, 500);
    }

  const jobs = data || [];
  const withFeatured = await attachFeaturedStatus(jobs as Job[]);
  const enriched = await attachEmployerVerified(withFeatured);
  const sorted = sortFeaturedJobs(enriched);

  return NextResponse.json({ 
    data: sorted,
    meta: {
        total: count || 0,
        limit,
        page: pageParam,
        has_more: count ? (offset + jobs.length < count) : false
    },
    source: "db"
  }, {
      headers: { 
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
  });
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "employer" && role !== "admin") {
    return jsonError("FORBIDDEN", "Employer or Admin access required.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = JobCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const normalized = normalizeJobPayload(parsed.data);
  const { data, error } = await supabase
    .from("jobs")
    .insert({
        ...normalized,
        employer_id: authData.user.id
    })
    .select()
    .single();

  if (error || !data) {
    return jsonError("DB_INSERT_FAILED", error?.message || "Unable to create job.", 500);
  }

  const job = data as Job;

  // Log audit event
  try {
    await logAudit({
      actorId: authData.user.id,
      action: "job_created",
      entityType: "job",
      entityId: job.id,
      meta: {
        title: job.title,
        location: job.location,
      },
    });
  } catch (auditError) {
    console.error("Failed to log job creation audit:", auditError);
  }

  // Match with saved searches and enqueue notifications
  const serviceSupabase = createServiceRoleClient();
  if (serviceSupabase) {
    try {
      // 1. Fetch all saved searches
      const { data: searches } = await serviceSupabase
        .from("saved_searches")
        .select("id, jobseeker_id, frequency, search_criteria");

      if (searches && searches.length > 0) {
        const notificationsToInsert = searches
          .filter((search) => {
            const { match } = matchJobToSearch(job, search.search_criteria as SavedSearchCriteria);
            return match;
          })
          .map((search) => ({
            user_id: search.jobseeker_id,
            job_id: job.id,
            saved_search_id: search.id,
            channel: "email",
            status: search.frequency === "instant" ? "pending" : "queued",
          }));

        if (notificationsToInsert.length > 0) {
          await serviceSupabase.from("notifications").insert(notificationsToInsert);
        }
      }
    } catch (matchError) {
      console.error("Alert matching failed:", matchError);
    }
  }

  try {
    const [withFeatured] = await attachFeaturedStatus([job]);
    const [enriched] = await attachEmployerVerified([withFeatured]);
    await upsertJobs([enriched as Job]);
  } catch (indexError) {
    // Best-effort indexing
  }

  return NextResponse.json({ data: job }, { status: 201 });
}
