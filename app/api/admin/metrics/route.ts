import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  try {
    const [
      { count: activeJobs },
      { count: pendingVerifications },
      { count: openReports },
      { count: totalUsers }
    ] = await Promise.all([
      supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
      // Note: verification_status column missing in prod, counting all employer profiles for now
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "employer"),
      supabase.from("job_reports").select("*", { count: "exact", head: true }).in("status", ["new", "reviewing"]),
      supabase.from("profiles").select("*", { count: "exact", head: true })
    ]);

    return NextResponse.json({
      data: {
        active_jobs: activeJobs || 0,
        pending_employer_verifications: pendingVerifications || 0,
        open_reports: openReports || 0,
        total_users: totalUsers || 0,
      }
    });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}
