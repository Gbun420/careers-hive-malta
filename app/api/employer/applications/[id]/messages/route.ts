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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const { data, error } = await supabase
    .from("application_messages")
    .select("*")
    .eq("application_id", id)
    .order("created_at", { ascending: true });

  if (error) return jsonError("DB_ERROR", error.message, 500);

  return NextResponse.json({ data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const role = getUserRole(user);
  if (role !== "employer" && role !== "admin") return jsonError("FORBIDDEN", "Employer access required.", 403);

  try {
    const { body } = await request.json();
    if (!body) return jsonError("INVALID_INPUT", "Message content is required.", 400);

    // Get application and jobseeker email
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (title),
        candidate:profiles!applications_user_id_fkey (id, full_name)
      `)
      .eq("id", id)
      .single();

    if (appError) return jsonError("DB_ERROR", appError.message, 500);
    if (!application) return jsonError("NOT_FOUND", "Application not found.", 404);

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from("application_messages")
      .insert({
        application_id: id,
        sender_id: user.id,
        sender_role: 'EMPLOYER',
        body: body
      })
      .select()
      .single();

    if (msgError) return jsonError("DB_ERROR", msgError.message, 500);

    // Send email notification to candidate (background attempt)
    const { data: userData } = await supabase.auth.admin.getUserById(application.user_id);
    const candidateEmail = userData?.user?.email;

    if (candidateEmail) {
      try {
        await sendEmail(
          candidateEmail,
          `New message regarding your application for ${application.job.title}`,
          `
            <p>Hi ${application.candidate.full_name},</p>
            <p>You have received a new message from the employer regarding your application for <strong>${application.job.title}</strong>.</p>
            <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin: 16px 0; border: 1px solid #e2e8f0;">
              ${body}
            </div>
            <p><a href="${APP_BASE_URL}/jobseeker/applications/${id}" style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application & Reply</a></p>
          `
        );
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
      }
    }

    trackEvent('employer_message_sent' as any, { application_id: id });

    return NextResponse.json({ data: message });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", "Invalid input", 400);
  }
}