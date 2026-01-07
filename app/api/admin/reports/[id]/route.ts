import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ReportActionSchema = z.object({
  action: z.enum(["RESOLVE", "DISMISS", "TAKEDOWN"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase, user: adminUser } = adminAuth;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = ReportActionSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const { action, notes } = parsed.data;

  // 1. Get the report to find the job_id
  const { data: report, error: fetchError } = await supabase
    .from("job_reports")
    .select("job_id")
    .eq("id", id)
    .single();

  if (fetchError || !report) return jsonError("NOT_FOUND", "Report not found", 404);

  const status = action === "DISMISS" ? "dismissed" : "resolved";

  // 2. Update the report
  const { data, error } = await supabase
    .from("job_reports")
    .update({
      status,
      resolution_notes: notes,
      reviewed_at: new Date().toISOString(),
      reviewer_id: adminUser.id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return jsonError("DB_ERROR", error.message, 500);

  // 3. If action is TAKEDOWN, unpublish the job
  if (action === "TAKEDOWN") {
    const { error: jobError } = await supabase
      .from("jobs")
      .update({ is_active: false })
      .eq("id", report.job_id);
    
    if (jobError) return jsonError("DB_ERROR", `Failed to takedown job: ${jobError.message}`, 500);
  }

  await logAudit({
    actorId: adminUser.id,
    actorEmail: adminUser.email || "",
    action: `job_report_${action.toLowerCase()}`,
    entityType: "job_report",
    entityId: id,
    metadata: { notes, action, job_id: report.job_id },
  });

  return NextResponse.json({ data });
}