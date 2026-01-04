import { NextResponse } from "next/server";
import { requireDevSecret } from "@/lib/dev/guard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const dev = requireDevSecret(request);
  if (!dev.ok) {
    return dev.response;
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { error } = await supabase.rpc("pgrst_reload_schema");
  if (error) {
    if (error.message?.includes("pgrst_reload_schema")) {
      return jsonError(
        "MIGRATION_OUT_OF_SYNC",
        "Schema reload function is missing. Apply migrations and retry.",
        503,
        { missing: ["pgrst_reload_schema"] }
      );
    }
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
