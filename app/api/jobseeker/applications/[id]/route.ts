import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { sendEmail } from "@/lib/email/sender";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  // Fetch detail with messages
  // Note: RLS ensures user only sees their own application and its messages
  const { data, error } = await supabase
    .from("applications")
    .select(`
      *,
      job:jobs(
        id,
        title,
        location,
        company_name,
        company_id,
        description
      ),
      messages:application_messages(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Fetch application detail error:", error);
    return jsonError("NOT_FOUND", "Application not found or unauthorized.", 404);
  }

  // Sort messages ascending
  if (data.messages) {
    data.messages.sort((a: any, b: any) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  try {
    const { body } = await request.json();
    if (!body || body.trim().length < 2) {
      return jsonError("INVALID_INPUT", "Message too short.", 400);
    }

    // 1. Verify ownership
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select("id, job_id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (appError || !app) {
      return jsonError("FORBIDDEN", "Unauthorized.", 403);
    }

    // 2. Insert message
    const { data: message, error: msgError } = await supabase
      .from("application_messages")
      .insert({
        application_id: id,
        sender_role: 'CANDIDATE',
        sender_id: user.id,
        body: body.trim(),
        status: 'sent'
      })
      .select()
      .single();

    if (msgError) return jsonError("DB_ERROR", msgError.message, 500);

    // 3. Optional: Notify employer via email (Mirror logic)
    const serviceSupabase = createServiceRoleClient();
    if (serviceSupabase) {
      const { data: job } = await serviceSupabase
        .from("jobs")
        .select("title, employer_id, profiles!employer_id(full_name)")
        .eq("id", app.job_id)
        .single();
      
      if (job) {
        const { data: employerUser } = await serviceSupabase.auth.admin.getUserById(job.employer_id);
        const employerEmail = employerUser.user?.email;

        if (employerEmail) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";
          await sendEmail(
            employerEmail,
            `New reply from candidate for ${job.title}`,
            `
              <p>You have received a new message from a candidate.</p>
              <p><strong>Message:</strong></p>
              <blockquote style="font-style: italic; border-left: 4px solid #0d748c; padding-left: 16px;">
                "${body}"
              </blockquote>
              <p><a href="${baseUrl}/employer/applications/${id}">View in Dashboard</a></p>
            `
          );
        }
      }
    }

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", err.message || "Invalid JSON", 400);
  }
}
