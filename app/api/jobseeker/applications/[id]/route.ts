import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { sendEmail } from "@/lib/email/sender";
import { trackEvent } from "@/lib/analytics";
import { absUrl, SITE_URL } from "@/lib/site/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const role = getUserRole(authData.user);
  if (role !== "jobseeker" && role !== "admin") return jsonError("FORBIDDEN", "Access restricted.", 403);

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs (
        id,
        title,
        employer:profiles!jobs_employer_id_fkey (id, full_name, headline)
      ),
      messages:application_messages (*)
    `)
    .eq("id", id)
    .single();

  if (appError || !application) return jsonError("NOT_FOUND", "Application not found.", 404);

  // Security: Check if it's the seeker's own application
  if (role === "jobseeker" && application.candidate_id !== authData.user.id) {
    return jsonError("FORBIDDEN", "Access restricted.", 403);
  }

  return NextResponse.json({ data: application });
}

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
  if (role !== "jobseeker") return jsonError("FORBIDDEN", "Only jobseekers can send messages.", 403);

  try {
    const { content } = await request.json();
    if (!content) return jsonError("INVALID_INPUT", "Message content is required.", 400);

    // Rate limiting check
    const { count: recentMessages } = await supabase
      .from("application_messages")
      .select("*", { count: "exact", head: true })
      .eq("sender_id", authData.user.id)
      .gt("created_at", new Date(Date.now() - 60 * 1000).toISOString());

    if (recentMessages && recentMessages >= 10) {
      return jsonError("RATE_LIMIT_EXCEEDED", "Too many messages. Please wait a minute.", 429);
    }

    // Get application and employer email
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs (title, employer_id),
        candidate:profiles!applications_candidate_id_fkey (full_name)
      `)
      .eq("id", id)
      .single();

    if (appError || !application) return jsonError("NOT_FOUND", "Application not found.", 404);

    if (application.candidate_id !== authData.user.id) {
      return jsonError("FORBIDDEN", "Access restricted.", 403);
    }

    // Get employer email
    const { data: userData } = await supabase.auth.admin.getUserById(application.job.employer_id);
    const employerEmail = userData?.user?.email;

    const { data: message, error: msgError } = await supabase
      .from("application_messages")
      .insert({
        application_id: id,
        sender_id: authData.user.id,
        content
      })
      .select()
      .single();

    if (msgError) throw msgError;

    if (employerEmail) {
      await sendEmail(
        employerEmail,
        `New message from ${application.candidate.full_name} for your job: ${application.job.title}`,
        `
          <p>Hi,</p>
          <p>You have received a new message from a candidate regarding your job <strong>${application.job.title}</strong>.</p>
          <div style="padding: 16px; background: #f8fafc; border-radius: 8px; margin: 16px 0; border: 1px solid #e2e8f0;">
            ${content}
          </div>
          <p><a href="${absUrl(`/employer/applications/${id}`)}" style="display: inline-block; padding: 12px 24px; background: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">View Application & Reply</a></p>
        `
      );
    }

    trackEvent('jobseeker_message_sent' as any, { application_id: id });

    return NextResponse.json({ data: message });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}