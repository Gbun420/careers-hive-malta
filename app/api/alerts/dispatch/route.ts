import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { isEmailConfigured, sendJobAlertEmail } from "@/lib/email/sender";

const dispatchSecret = process.env.ALERT_DISPATCH_SECRET;

export async function POST(request: Request) {
  const providedSecret = request.headers.get("x-alert-dispatch-secret");
  if (!dispatchSecret || providedSecret !== dispatchSecret) {
    return jsonError("FORBIDDEN", "Invalid dispatch secret.", 403);
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
  const limit = Number(url.searchParams.get("limit") ?? "100");

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("id, user_id, job_id, saved_search_id, status")
    .eq("status", "pending")
    .eq("channel", "email")
    .order("created_at", { ascending: true })
    .limit(Number.isNaN(limit) ? 100 : limit);

  if (error) {
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
        "id, employer_id, title, description, location, salary_range, created_at, is_active"
      )
      .eq("id", notification.job_id)
      .single();

    if (jobError || !jobData) {
      failed += 1;
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
