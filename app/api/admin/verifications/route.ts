import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { jsonError } from "@/lib/api/errors";

export async function GET() {

export const runtime = "edge";
export const dynamic = "force-dynamic";
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data, error } = await auth.supabase
    .from("employer_verifications")
    .select("id, employer_id, status, notes, submitted_at, reviewed_at, reviewer_id")
    .order("submitted_at", { ascending: false });

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data });
}
