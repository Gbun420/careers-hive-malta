import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";
import { logAudit } from "@/lib/audit/log";
import { z } from "zod";

export const dynamic = "force-dynamic";

const VerifySchema = z.object({
  decision: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase, user: adminUser } = adminAuth;

  try {
    const body = await request.json();
    const parsed = VerifySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
    }

    const { decision, notes } = parsed.data;
    const status = decision === "APPROVE" ? "approved" : "rejected";

    const { data, error } = await supabase
      .from("profiles")
      .update({
        verification_status: status,
        verified_at: new Date().toISOString(),
        verified_by: adminUser.id,
        verification_notes: notes,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      actorId: adminUser.id,
      actorEmail: adminUser.email || "",
      action: `employer_verification_${status}`,
      entityType: "profile",
      entityId: id,
      metadata: { notes, decision },
    });

    return NextResponse.json({ data });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}
