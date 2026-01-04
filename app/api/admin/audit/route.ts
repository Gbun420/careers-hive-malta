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
    .from("audit_logs")
    .select("id, actor_id, action, entity_type, entity_id, meta, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data });
}
