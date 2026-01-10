import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email/sender";
import { trackEvent } from "@/lib/analytics";
import { SITE_URL } from "@/lib/site/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_BASE_URL = SITE_URL;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const role = getUserRole(authData.user);
  if (role !== "employer" && role !== "admin") return jsonError("FORBIDDEN", "Employer access required.", 403);

  try {
    const { content } = await request.json();
    if (!content) return jsonError("INVALID_INPUT", "Message content is required.", 400);

    // Rate limiting check
    try {
      const { count: recentMessages, error: rateError } = await supabase
        .from("application_messages")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", authData.user.id)
        .gt("created_at", new Date(Date.now() - 60 * 1000).toISOString());

      if (rateError) {
        const msg = rateError.message?.toLowerCase() || "";
        if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
          // If message table is missing, skip rate limit
        } else {
          throw rateError;
        }
      } else if (recentMessages && recentMessages >= 10) {
        return jsonError("RATE_LIMIT_EXCEEDED", "Too many messages. Please wait a minute.", 429);
      }
    } catch (e) {
      // Ignore rate limit errors if table is missing
    }

    // Get application and jobseeker email
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (title),
        candidate:profiles!applications_candidate_id_fkey (id, full_name)
      `)
      .eq("id", id)
      .single();

    if (appError) {
      const msg = appError.message?.toLowerCase() || "";
      if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
        return jsonError("NOT_FOUND", "Applications feature coming soon", 404);
      }
      return jsonError("DB_ERROR", appError.message, 500);
    }
    if (!application) return jsonError("NOT_FOUND", "Application not found.", 404);

    const { data: userData } = await supabase.auth.admin.getUserById(application.candidate_id);
    const candidateEmail = userData?.user?.email;

    const { data: message, error: msgError } = await supabase
      .from("application_messages")
      .insert({
        application_id: id,
        sender_id: authData.user.id,
        content
      })
      .select()
      .single();

    if (msgError) {
      const msg = msgError.message?.toLowerCase() || "";
      if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
        return jsonError("NOT_FOUND", "Messaging feature coming soon", 404);
      }
      throw msgError;
    }

    if (candidateEmail) {
      await sendEmail(
        candidateEmail,
        `New message regarding your application for ${application.job.title}`,
        `
          <p>Hi ${application.candidate.full_name},</p>
          <p>You have received a new message from the employer regarding your application for <strong>${application.job.title}</strong>.</p>
          <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin: 16px 0; border: 1px solid #e2e8f0;">
            ${content}
          </div>
          <p><a href="${APP_BASE_URL}/jobseeker/applications/${id}" style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application & Reply</a></p>
        `
      );
    }

    trackEvent('employer_message_sent' as any, { application_id: id });

    return NextResponse.json({ data: message });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}