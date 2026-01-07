import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { updateApplicant, ApplicantFields } from "@/lib/airtable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    
    // Server-side whitelist of editable fields
    const allowedFields: (keyof ApplicantFields)[] = [
      "Stage",
      "Onsite interview",
      "Onsite interview score",
      "Onsite interview notes"
    ];

    const fieldsToUpdate: Partial<ApplicantFields> = {};
    for (const field of allowedFields) {
      if (field in body) {
        fieldsToUpdate[field] = body[field];
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    await updateApplicant(id, fieldsToUpdate);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Airtable update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}