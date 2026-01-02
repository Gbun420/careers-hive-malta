import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { ReportCreateSchema } from "@/lib/trust/schema";

type RouteParams = {
  params: { id: string };
};

export async function POST(request: Request, { params }: RouteParams) {
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

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = ReportCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();

  if (jobError || !job) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  const { data, error } = await supabase
    .from("job_reports")
    .insert({
      job_id: params.id,
      reporter_id: authData.user.id,
      reason: parsed.data.reason,
    })
    .select(
      "id, job_id, reporter_id, status, reason, resolution_notes, created_at, reviewed_at, reviewer_id"
    )
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data }, { status: 201 });
}
