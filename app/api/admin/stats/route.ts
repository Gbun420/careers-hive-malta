import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  // Parallelize queries for performance
  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: pendingVerifications },
    { count: pendingReports },
    { count: totalUsers }
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("employer_verifications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("job_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true })
  ]);

  return NextResponse.json({
    data: {
      jobs: {
        total: totalJobs || 0,
        active: activeJobs || 0,
      },
      verifications: {
        pending: pendingVerifications || 0,
      },
      reports: {
        pending: pendingReports || 0,
      },
      users: {
        total: totalUsers || 0,
      }
    }
  });
}