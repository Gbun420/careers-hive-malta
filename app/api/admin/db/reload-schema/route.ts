import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { jsonError } from "@/lib/api/errors";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.supabase || !auth.user) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  // We use the service role capability via the RPC function already defined in migration 0008
  const { error } = await auth.supabase.rpc("pgrst_reload_schema");

  if (error) {
    console.error("Schema reload failed:", error);
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ ok: true, message: "Schema cache reload triggered successfully." });
}
