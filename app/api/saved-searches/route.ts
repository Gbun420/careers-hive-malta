import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { SavedSearchCreateSchema } from "@/lib/alerts/criteria";

export async function GET() {

export const runtime = "edge";
export const dynamic = "force-dynamic";
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
  if (role !== "jobseeker") {
    return jsonError("FORBIDDEN", "Jobseeker access required.", 403);
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, created_at, frequency, search_criteria")
    .eq("jobseeker_id", authData.user.id)
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
  if (role !== "jobseeker") {
    return jsonError("FORBIDDEN", "Jobseeker access required.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = SavedSearchCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data, error } = await supabase
    .from("saved_searches")
    .insert({
      jobseeker_id: authData.user.id,
      frequency: parsed.data.frequency,
      search_criteria: parsed.data.search_criteria,
    })
    .select("id, created_at, frequency, search_criteria")
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data }, { status: 201 });
}
