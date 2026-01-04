import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { JobUpdateSchema, normalizeJobPayload } from "@/lib/jobs/schema";
import { removeJobs, upsertJobs } from "@/lib/search/meili";
import type { Job } from "@/lib/jobs/schema";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";


export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function getSupabase() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { supabase: null, error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503) };
  }
  return { supabase };
}

export async function GET(_: Request, { params }: RouteParams) {
  const { id } = await params;
  const auth = await getSupabase();
  if (!auth.supabase) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const publicCacheHeaders = {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
  const { data: authData } = await auth.supabase.auth.getUser();
  const role = getUserRole(authData.user ?? null);

  if (role === "employer" && authData.user) {
    const { data, error } = await auth.supabase
      .from("jobs")
      .select(
        "id, employer_id, title, description, location, salary_range, created_at, is_active"
      )
      .eq("id", id)
      .eq("employer_id", authData.user.id)
      .single();

    if (!error && data) {
      const [withFeatured] = await attachFeaturedStatus([data as Job]);
      const [enriched] = await attachEmployerVerified([withFeatured ?? data]);
      return NextResponse.json({ data: enriched ?? withFeatured ?? data });
    }
  }

  const { data, error } = await auth.supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  const [withFeatured] = await attachFeaturedStatus([data as Job]);
  const [enriched] = await attachEmployerVerified([withFeatured ?? data]);
  return NextResponse.json(
    { data: enriched ?? withFeatured ?? data },
    { headers: publicCacheHeaders }
  );
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
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

  const parsed = JobUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const normalized = normalizeJobPayload(parsed.data);
  const { data, error } = await auth.supabase
    .from("jobs")
    .update(normalized)
    .eq("id", id)
    .eq("employer_id", authData.user.id)
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  const [withFeatured] = await attachFeaturedStatus([data as Job]);
  const [enriched] = await attachEmployerVerified([withFeatured ?? data]);

  try {
    await upsertJobs([(enriched ?? withFeatured ?? data) as Job]);
  } catch (indexError) {
    // Best-effort indexing only.
  }

  return NextResponse.json({ data: enriched ?? withFeatured ?? data });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const { id } = await params;
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

  const { data, error } = await auth.supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("employer_id", authData.user.id)
    .select("id")
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  try {
    await removeJobs([id]);
  } catch (indexError) {
    // Best-effort indexing only.
  }

  return NextResponse.json({ data });
}
