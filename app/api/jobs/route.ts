import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { JobCreateSchema, normalizeJobPayload } from "@/lib/jobs/schema";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const url = new URL(request.url);
  const mine = url.searchParams.get("mine") === "true";

  if (mine) {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return jsonError("UNAUTHORIZED", "Authentication required.", 401);
    }
    const role = getUserRole(authData.user);
    if (role !== "employer") {
      return jsonError("FORBIDDEN", "Employer access required.", 403);
    }

    const { data, error } = await supabase
      .from("jobs")
      .select(
        "id, employer_id, title, description, location, salary_range, created_at, is_active"
      )
      .eq("employer_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return jsonError("DB_ERROR", error.message, 500);
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
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

  const parsed = JobCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const normalized = normalizeJobPayload(parsed.data);
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      employer_id: authData.user.id,
      title: normalized.title,
      description: normalized.description,
      location: normalized.location,
      salary_range: normalized.salary_range,
      is_active: normalized.is_active ?? true,
    })
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active"
    )
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data }, { status: 201 });
}
