import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { JobUpdateSchema, normalizeJobPayload } from "@/lib/jobs/schema";
import { removeJobs, upsertJobs } from "@/lib/search/meili";
import type { Job } from "@/lib/jobs/schema";

type RouteParams = {
  params: { id: string };
};

async function getSupabase() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { supabase: null, error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503) };
  }
  return { supabase };
}

export async function GET(_: Request, { params }: RouteParams) {
  const auth = await getSupabase();
  if (!auth.supabase) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData } = await auth.supabase.auth.getUser();
  const role = getUserRole(authData.user ?? null);

  if (role === "employer" && authData.user) {
    const { data, error } = await auth.supabase
      .from("jobs")
      .select(
        "id, employer_id, title, description, location, salary_range, created_at, is_active"
      )
      .eq("id", params.id)
      .eq("employer_id", authData.user.id)
      .single();

    if (!error && data) {
      return NextResponse.json({ data });
    }
  }

  const { data, error } = await auth.supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .eq("id", params.id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  try {
    await upsertJobs([data as Job]);
  } catch (indexError) {
    // Best-effort indexing only.
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: RouteParams) {
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
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = JobUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const normalized = normalizeJobPayload(parsed.data);
  const { data, error } = await auth.supabase
    .from("jobs")
    .update(normalized)
    .eq("id", params.id)
    .eq("employer_id", authData.user.id)
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: RouteParams) {
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
    .eq("id", params.id)
    .eq("employer_id", authData.user.id)
    .select("id")
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  try {
    await removeJobs([params.id]);
  } catch (indexError) {
    // Best-effort indexing only.
  }

  return NextResponse.json({ data });
}
