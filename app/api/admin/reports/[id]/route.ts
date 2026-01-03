import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { jsonError } from "@/lib/api/errors";
import { ReportUpdateSchema } from "@/lib/trust/schema";
import { logAudit } from "@/lib/audit/log";

type RouteParams = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = ReportUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const { data, error } = await auth.supabase
    .from("job_reports")
    .update({
      status: parsed.data.status,
      resolution_notes: parsed.data.resolution_notes ?? null,
      reviewed_at: new Date().toISOString(),
      reviewer_id: auth.user.id,
    })
    .eq("id", params.id)
    .select(
      "id, job_id, reporter_id, status, reason, details, resolution_notes, created_at, reviewed_at, reviewer_id"
    )
    .single();

  if (error || !data) {
    return jsonError("NOT_FOUND", "Report not found.", 404);
  }

  await logAudit({
    actorId: auth.user.id,
    action: `report_${data.status}`,
    entityType: "job_report",
    entityId: data.id,
    meta: {
      job_id: data.job_id,
      status: data.status,
      resolution_notes: data.resolution_notes,
    },
  });

  return NextResponse.json({ data });
}
