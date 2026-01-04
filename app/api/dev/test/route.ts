import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export async function GET(request: Request) {

export const runtime = "edge";
export const dynamic = "force-dynamic";
  // Dev-only endpoint
  if (process.env.NODE_ENV === "production") {
    return jsonError("NOT_FOUND", "Endpoint not available in production", 404);
  }

  // Verify dev secret
  const devSecret = request.headers.get("x-dev-secret");
  if (devSecret !== process.env.DEV_TOOLS_SECRET) {
    return jsonError("UNAUTHORIZED", "Invalid dev secret", 401);
  }

  const serviceSupabase = createServiceRoleClient();
  if (!serviceSupabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);
  }

  // Test basic query
  const { data: jobs, error } = await serviceSupabase
    .from("jobs")
    .select("id, title")
    .limit(3);

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ jobs });
}
