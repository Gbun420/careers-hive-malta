import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { VerificationRequestSchema } from "@/lib/trust/schema";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";

async function getEmployerAuth() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { supabase: null, error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503) };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { supabase: null, error: jsonError("UNAUTHORIZED", "Authentication required.", 401) };
  }

  const role = getUserRole(authData.user);
  if (role !== "employer") {
    return { supabase: null, error: jsonError("FORBIDDEN", "Employer access required.", 403) };
  }

  return { supabase, userId: authData.user.id };
}

export async function GET() {
  const auth = await getEmployerAuth();
  if (!auth.supabase || !auth.userId) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data, error } = await auth.supabase
    .from("employer_verifications")
    .select("id, employer_id, status, notes, submitted_at, reviewed_at, reviewer_id")
    .eq("employer_id", auth.userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data: data ?? null });
}

export async function POST(request: Request) {
  const auth = await getEmployerAuth();
  if (!auth.supabase || !auth.userId) {
    return auth.error ?? jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const rateKey = buildRateLimitKey(
    request,
    "employer-verification",
    auth.userId
  );
  const limit = await rateLimit(rateKey, { windowMs: 60 * 60_000, max: 2 });
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

  const parsed = VerificationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("BAD_REQUEST", parsed.error.errors[0]?.message, 400);
  }

  const { data: existing } = await auth.supabase
    .from("employer_verifications")
    .select("id, status")
    .eq("employer_id", auth.userId)
    .in("status", ["pending", "approved"])
    .order("submitted_at", { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    const status = existing[0].status;
    const message =
      status === "approved"
        ? "Employer is already verified."
        : "A verification request is already pending.";
    return jsonError("INVALID_INPUT", message, 409);
  }

  const { data, error } = await auth.supabase
    .from("employer_verifications")
    .insert({
      employer_id: auth.userId,
      notes: parsed.data.notes || null,
    })
    .select("id, employer_id, status, notes, submitted_at, reviewed_at, reviewer_id")
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data }, { status: 201 });
}
