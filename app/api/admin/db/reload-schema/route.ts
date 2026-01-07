import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  // We use the service role capability via the RPC function already defined in migration 0008
  const { error } = await supabase.rpc("pgrst_reload_schema");

  if (error) {
    console.error("Schema reload failed:", error);
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ ok: true, message: "Schema cache reload triggered successfully." });
}