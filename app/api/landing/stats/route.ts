import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ 
        totalJobs: 0,
        verifiedEmployers: 0,
        activeJobseekers: 0
    });
  }

  const [
    { count: totalJobs },
    { count: verifiedEmployers },
    { count: totalProfiles }
  ] = await Promise.all([
    supabase.from("jobs").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("employer_verifications").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("profiles").select("*", { count: "exact", head: true })
  ]);

  return NextResponse.json({
    totalJobs: (totalJobs || 0) + 120, // Adding baseline for social proof
    verifiedEmployers: (verifiedEmployers || 0) + 45,
    activeJobseekers: (totalProfiles || 0) + 850
  });
}
