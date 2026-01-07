import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { listApplicants, listInterviewingApplicants, getInterviewersMap } from "@/lib/airtable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  try {
    const [interviewersMap, applicants] = await Promise.all([
      getInterviewersMap(),
      mode === "interviewing" ? listInterviewingApplicants() : listApplicants(),
    ]);

    return NextResponse.json({
      applicants,
      interviewersMap,
    });
  } catch (err: any) {
    console.error("Airtable fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}