import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { SavedSearchUpdateSchema } from "@/lib/alerts/criteria";


export const runtime = "edge";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

async function getAuthedJobseeker() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { supabase: null, error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503) };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { supabase: null, error: jsonError("UNAUTHORIZED", "Authentication required.", 401) };
  }

  const role = getUserRole(authData.user);
  if (role !== "jobseeker" && role !== "admin") {
    return { supabase: null, error: jsonError("FORBIDDEN", "Jobseeker or Admin access required.", 403) };
  }

  return { supabase, userId: authData.user.id };
}

export async function GET(_: Request, { params }: RouteParams) {
  const { id } = await params;
  const auth = await getAuthedJobseeker();
  if (!auth.supabase || !auth.userId) {
    return auth.error ?? jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const { data, error } = await auth.supabase
    .from("saved_searches")
    .select("id, created_at, frequency, search_criteria")
    .eq("id", id)
    .eq("jobseeker_id", auth.userId)
    .single();

  if (error) {
    return jsonError("NOT_FOUND", "Saved search not found.", 404);
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const auth = await getAuthedJobseeker();
  if (!auth.supabase || !auth.userId) {
    return auth.error ?? jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = SavedSearchUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data, error } = await auth.supabase
    .from("saved_searches")
    .update(parsed.data)
    .eq("id", id)
    .eq("jobseeker_id", auth.userId)
    .select("id, created_at, frequency, search_criteria")
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Saved search not found.", 404);
  }

  return NextResponse.json({ data });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const { id } = await params;
  const auth = await getAuthedJobseeker();
  if (!auth.supabase || !auth.userId) {
    return auth.error ?? jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const { data, error } = await auth.supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("jobseeker_id", auth.userId)
    .select("id")
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Saved search not found.", 404);
  }

  return NextResponse.json({ data });
}
