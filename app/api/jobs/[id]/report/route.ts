import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { ReportCreateSchema } from "@/lib/trust/schema";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";
import { auditLogger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const startTime = Date.now();
  const supabase = createRouteHandlerClient();

  const fail = (
    code: Parameters<typeof jsonError>[0],
    message: string,
    status: number,
    details?: Record<string, unknown>,
    userId?: string
  ) => {
    auditLogger.logRequest(request, startTime, status, userId, code);
    return jsonError(code, message, status, details);
  };

  if (!supabase) {
    return fail(
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

  if (authError) {
    return fail("UNAUTHORIZED", "Authentication required.", 401);
  }

  const user = authData?.user;
  if (!user?.id) {
    auditLogger.logSecurityEvent("INVALID_TOKEN", { route: request.nextUrl.pathname });
    return fail("UNAUTHORIZED", "Authentication required.", 401);
  }
  const userId = user.id;

  // Use service role client for database operations (bypasses RLS)
  const serviceSupabase = createServiceRoleClient();
  if (!serviceSupabase) {
    return fail("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503, undefined, userId);
  }

  const rateKey = buildRateLimitKey(request, "job-report", userId);
  const limit = await rateLimit(rateKey, { windowMs: 60_000, max: 5 });
  if (!limit.ok) {
    return fail(
      "RATE_LIMITED",
      "Too many requests. Try again later.",
      429,
      { resetAt: limit.resetAt },
      userId
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return fail("BAD_REQUEST", "Invalid JSON body.", 400, undefined, userId);
  }

  const parsed = ReportCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("BAD_REQUEST", parsed.error.errors[0]?.message, 400, undefined, userId);
  }

  const { data: job, error: jobError } = await serviceSupabase
    .from("jobs")
    .select("id")
    .eq("id", id)
    .single();

  if (jobError || !job) {
    return fail("NOT_FOUND", "Job not found.", 404, undefined, userId);
  }

  const { data: existing } = await serviceSupabase
    .from("job_reports")
    .select("id, status")
    .eq("job_id", id)
    .eq("reporter_id", userId)
    .in("status", ["new", "reviewing"])
    .limit(1);

  if (existing && existing.length > 0) {
    return fail(
      "DUPLICATE_REPORT",
      "You already reported this job.",
      409,
      undefined,
      userId
    );
  }

  const { data, error } = await serviceSupabase
    .from("job_reports")
    .insert({
      job_id: id,
      reporter_id: userId,
      reason: parsed.data.reason,
      details: parsed.data.details ?? null,
    })
    .select(
      "id, job_id, reporter_id, status, reason, details, resolution_notes, created_at, reviewed_at, reviewer_id"
    )
    .single();

  if (error) {
    const message = error.message ?? "";
    const missingDetails =
      message.includes("details") &&
      (message.includes("schema cache") ||
        message.includes("job_reports.details") ||
        (message.includes("job_reports") && message.includes("does not exist")));
    if (missingDetails) {
      return fail(
        "MIGRATION_OUT_OF_SYNC",
        "Database schema is missing required column(s). Reload schema cache after applying migrations.",
        503,
        { missing: ["job_reports.details"] },
        userId
      );
    }
    if (
      error.code === "23505" ||
      error.message?.includes("job_reports_unique_open_idx") ||
      error.message?.includes("duplicate key value")
    ) {
      return fail(
        "DUPLICATE_REPORT",
        "You already reported this job.",
        409,
        undefined,
        userId
      );
    }
    return fail("DB_ERROR", error.message, 500, undefined, userId);
  }

  auditLogger.logRequest(request, startTime, 201, userId);
  return NextResponse.json({ data }, { status: 201 });
}
