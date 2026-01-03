import { NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { ReportCreateSchema } from "@/lib/trust/schema";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";

type RouteParams = {
  params: { id: string };
};

export async function POST(request: Request, { params }: RouteParams) {
  const supabase = createRouteHandlerClient();
  
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  // Support bearer token auth for dev testing
  const authHeader = request.headers.get("authorization");
  let authData, authError;

  if (authHeader?.startsWith("Bearer ")) {
    // Bearer token auth (dev testing) - create a client with the token
    const token = authHeader.substring(7);
    const { createClient } = await import("@supabase/supabase-js");
    const tokenClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    const { data: tokenData, error: tokenError } = await tokenClient.auth.getUser(token);
    authData = tokenData;
    authError = tokenError;
  } else {
    // Cookie-based auth (normal flow)
    const { data: cookieData, error: cookieError } = await supabase.auth.getUser();
    authData = cookieData;
    authError = cookieError;
  }

  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  // Use service role client for database operations (bypasses RLS)
  const serviceSupabase = createServiceRoleClient();
  if (!serviceSupabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);
  }

  const rateKey = buildRateLimitKey(
    request,
    "job-report",
    authData.user.id
  );
  const limit = await rateLimit(rateKey, { windowMs: 60_000, max: 5 });
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      "Too many requests. Try again later.",
      429,
      { resetAt: limit.resetAt }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }

  const parsed = ReportCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const { data: job, error: jobError } = await serviceSupabase
    .from("jobs")
    .select("id")
    .eq("id", params.id)
    .single();

  if (jobError || !job) {
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  const { data: existing } = await serviceSupabase
    .from("job_reports")
    .select("id, status")
    .eq("job_id", params.id)
    .eq("reporter_id", authData.user.id)
    .in("status", ["new", "reviewing"])
    .limit(1);

  if (existing && existing.length > 0) {
    return jsonError(
      "DUPLICATE_REPORT",
      "You already reported this job.",
      409
    );
  }

  const { data, error } = await serviceSupabase
    .from("job_reports")
    .insert({
      job_id: params.id,
      reporter_id: authData.user.id,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    })
    .select(
      "id, job_id, reporter_id, status, reason, details, resolution_notes, created_at, reviewed_at, reviewer_id"
    )
    .single();

  if (error) {
    if (
      error.message?.includes("details") &&
      error.message?.includes("schema cache")
    ) {
      return jsonError(
        "MIGRATION_OUT_OF_SYNC",
        "Database schema is missing required column(s). Reload schema cache after applying migrations.",
        503,
        { missing: ["job_reports.details"] }
      );
    }
    if (
      error.code === "23505" ||
      error.message?.includes("job_reports_unique_open_idx") ||
      error.message?.includes("duplicate key value")
    ) {
      return jsonError(
        "DUPLICATE_REPORT",
        "You already reported this job.",
        409
      );
    }
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data }, { status: 201 });
}
