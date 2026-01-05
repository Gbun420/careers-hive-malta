import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { JobCreateSchema, normalizeJobPayload } from "@/lib/jobs/schema";
import { upsertJobs } from "@/lib/search/meili";
import type { Job } from "@/lib/jobs/schema";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus, sortFeaturedJobs, type JobWithFeatured } from "@/lib/billing/featured";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function getSupabase() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { supabase: null, error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503) };
  }
  return { supabase };
}

export async function GET(request: NextRequest) {
  const auth = await getSupabase();
  if (!auth.supabase) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { searchParams } = new URL(request.url);
  const mine = searchParams.get("mine") === "true";
  const query = searchParams.get("q");
  const location = searchParams.get("location");

  if (mine) {
    const { data: authData, error: authError } = await auth.supabase.auth.getUser();
    if (authError || !authData.user) {
      return jsonError("UNAUTHORIZED", "Authentication required.", 401);
    }
    const role = getUserRole(authData.user);
    if (role !== "employer") {
      return jsonError("FORBIDDEN", "Employer access required.", 403);
    }

    const { data, error } = await auth.supabase
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
  let dbQuery = auth.supabase
    .from("jobs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (location) {
    dbQuery = dbQuery.ilike("location", `%${location}%`);
  }
  
  if (query) {
    dbQuery = dbQuery.ilike("title", `%${query}%`);
  }

  const { data, error } = await dbQuery;

    if (error) {
         return jsonError("DB_ERROR", error.message, 500);
    }

  const withFeatured = await attachFeaturedStatus(data as Job[]);
  const enriched = await attachEmployerVerified(withFeatured);
  const sorted = sortFeaturedJobs(enriched);

  return NextResponse.json({ 
    data: sorted,
    source: "db"
  }, {
      headers: { 
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
  });
}

export async function POST(request: NextRequest) {
  const auth = await getSupabase();
  if (!auth.supabase) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await auth.supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "employer") {
    return jsonError("FORBIDDEN", "Employer access required.", 403);
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
  const { data, error } = await auth.supabase
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

  try {
    const [withFeatured] = await attachFeaturedStatus([data as Job]);
    const [enriched] = await attachEmployerVerified([withFeatured]);
    await upsertJobs([enriched as Job]);
  } catch (indexError) {
    // Best-effort indexing
  }

  return NextResponse.json({ data }, { status: 201 });
}
