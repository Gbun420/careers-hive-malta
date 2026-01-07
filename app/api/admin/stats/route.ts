import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "admin") {
    return jsonError("FORBIDDEN", "Admin access required.", 403);
  }

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
