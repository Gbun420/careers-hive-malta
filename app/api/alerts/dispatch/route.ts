import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { isEmailConfigured, sendJobAlertEmail } from "@/lib/email/sender";
import { buildRateLimitKey, rateLimit } from "@/lib/ratelimit";


const dispatchSecret = process.env.ALERT_DISPATCH_SECRET;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const providedSecret = request.headers.get("x-alert-dispatch-secret");
  if (!dispatchSecret || providedSecret !== dispatchSecret) {
    return jsonError("FORBIDDEN", "Invalid dispatch secret.", 403);
  }

  const rateKey = buildRateLimitKey(request, "alerts-dispatch");
  const limit = await rateLimit(rateKey, { windowMs: 60_000, max: 60 });
  if (!limit.ok) {
    return jsonError(
      "RATE_LIMITED",
      "Too many requests. Try again later.",
      429,
      { resetAt: limit.resetAt }
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  if (!isEmailConfigured()) {
    return jsonError(
      "EMAIL_NOT_CONFIGURED",
      "Email provider is not configured.",
      500
    );
  }

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get("limit") ?? "100");

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, user_id, job_id, saved_search_id, status")
    .eq("status", "pending")
    .eq("channel", "email")
    .order("created_at", { ascending: true })
    .limit(Number.isNaN(limitParam) ? 100 : limitParam);

  if (error) {
    console.error(
      JSON.stringify({
        event: "dispatch_failed",
        route: "/api/alerts/dispatch",
        request_id: requestId,
        error_code: "DB_ERROR",
        message: error.message,
      })
    );
    return jsonError("DB_ERROR", error.message, 500);
  }

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const notification of notifications ?? []) {
    processed += 1;

    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(notification.user_id as string);

    if (userError || !userData.user?.email) {
      failed += 1;
      console.error(
        JSON.stringify({
          event: "dispatch_failed",
          route: "/api/alerts/dispatch",
          request_id: requestId,
          error_code: "USER_LOOKUP_FAILED",
          message: userError?.message ?? "Missing user email.",
          user_id: notification.user_id,
        })
      );
      await supabase
        .from("notifications")
        .update({
          status: "failed",
          error: userError?.message ?? "Missing user email.",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
      continue;
    }

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select(
        "id, employer_id, title, description, location, salary_range, created_at, is_active, status"
      )
      .eq("id", notification.job_id)
      .single();

    if (jobError || !jobData) {
      failed += 1;
      console.error(
        JSON.stringify({
          event: "dispatch_failed",
          route: "/api/alerts/dispatch",
          request_id: requestId,
          error_code: "JOB_LOOKUP_FAILED",
          message: jobError?.message ?? "Job not found.",
          job_id: notification.job_id,
        })
      );
      await supabase
        .from("notifications")
        .update({
          status: "failed",
          error: jobError?.message ?? "Job not found.",
          sent_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
      continue;
    }

    const result = await sendJobAlertEmail({
      to: userData.user.email,
      job: jobData,
    });

    if (!result.ok) {
      failed += 1;
      console.error(
        JSON.stringify({
          event: "dispatch_failed",
          route: "/api/alerts/dispatch",
          request_id: requestId,
          error_code: "EMAIL_SEND_FAILED",
          message: result.message,
          user_id: notification.user_id,
          job_id: notification.job_id,
        })
      );
      await supabase
        .from("notifications")
        .update({
          status: "failed",
          error: result.message,
          sent_at: new Date().toISOString(),
        })
        .eq("id", notification.id);
      continue;
    }

    sent += 1;
    await supabase
      .from("notifications")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", notification.id);
  }

  return NextResponse.json({ processed, sent, failed });
}
