import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { listApplicants, listInterviewingApplicants, getInterviewersMap } from "@/lib/airtable";

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

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
