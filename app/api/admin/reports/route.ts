import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { jsonError } from "@/lib/api/errors";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {

export const runtime = "edge";
export const dynamic = "force-dynamic";
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data, error } = await auth.supabase
    .from("job_reports")
    .select(
      "id, job_id, reporter_id, status, reason, details, resolution_notes, created_at, reviewed_at, reviewer_id"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  let enriched = data ?? [];
  const service = createServiceRoleClient();
  if (service && enriched.length > 0) {
    const jobIds = Array.from(new Set(enriched.map((row) => row.job_id)));
    const { data: jobs } = await service
      .from("jobs")
      .select("id, title")
      .in("id", jobIds);

    const jobMap = new Map((jobs ?? []).map((job) => [job.id, job.title]));
    enriched = enriched.map((row) => ({
      ...row,
      job_title: jobMap.get(row.job_id) ?? null,
    }));
  }

  return NextResponse.json({ data: enriched });
}
