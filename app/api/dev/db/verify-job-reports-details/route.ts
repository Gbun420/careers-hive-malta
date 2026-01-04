import { NextResponse } from "next/server";
import { requireDevSecret } from "@/lib/dev/guard";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
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

  const { error } = await supabase
    .from("job_reports")
    .select("details")
    .limit(1);

  if (error) {
    const message = error.message ?? "";
    const missingDetails =
      message.includes("details") &&
      (message.includes("schema cache") ||
        message.includes("job_reports.details") ||
        (message.includes("job_reports") && message.includes("does not exist")));
    if (missingDetails) {
      return jsonError(
        "MIGRATION_OUT_OF_SYNC",
        "Database schema is missing required column(s). Reload schema cache after applying migrations.",
        503,
        { missing: ["job_reports.details"] }
      );
    }
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ ok: true });
}
