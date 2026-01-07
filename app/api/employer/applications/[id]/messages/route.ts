import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { sendEmployerMessageEmail } from "@/lib/email/sender";
import { trackEvent } from "@/lib/analytics";
import { rateLimit, buildRateLimitKey } from "@/lib/ratelimit";

export const runtime = "nodejs";

const MESSAGING_EMAIL_ENABLED = process.env.MESSAGING_EMAIL_ENABLED === "true";
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

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
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

  // 0. Rate Limiting
  const limitKey = buildRateLimitKey(request, "employer_message", user.id);
  const { ok, remaining } = await rateLimit(limitKey, { windowMs: 60 * 1000, max: 10 });
  if (!ok) {
    return jsonError("RATE_LIMIT_EXCEEDED", "Too many messages. Please wait a minute.", 429);
  }

  try {
    const { body, sender_role } = await request.json();
    if (!body || !sender_role) return jsonError("INVALID_INPUT", "Missing message data", 400);

    // 1. Insert message with 'sent' status
    const { data: message, error: insertError } = await supabase
      .from("application_messages")
      .insert({
        application_id: id,
        sender_role,
        sender_id: user.id,
        body,
        status: 'sent'
      })
      .select()
      .single();

    if (insertError) return jsonError("DB_ERROR", insertError.message, 500);

    // 2. Candidate Email Notification Logic
    if (sender_role === 'EMPLOYER' && MESSAGING_EMAIL_ENABLED) {
      const serviceSupabase = createServiceRoleClient();
      if (serviceSupabase) {
        // Fetch application, candidate, and job details
        const { data: appData } = await serviceSupabase
          .from("applications")
          .select(`
            user_id,
            job:jobs(title),
            candidate:profiles!user_id(full_name)
          `)
          .eq("id", id)
          .single();
        
        if (appData) {
          const { data: userData } = await serviceSupabase.auth.admin.getUserById(appData.user_id);
          const candidateEmail = userData.user?.email;
          const candidateName = (appData.candidate as any)?.full_name;
          const jobTitle = (appData.job as any)?.title || "your application";

          if (candidateEmail) {
            // A) Create delivery row first (idempotency)
            const { error: deliveryError } = await serviceSupabase
              .from("message_email_deliveries")
              .insert({
                message_id: message.id,
                recipient_user_id: appData.user_id,
                recipient_email: candidateEmail,
                status: 'PENDING'
              });

            if (!deliveryError) {
              // B) Send email
              const emailResult = await sendEmployerMessageEmail({
                to: candidateEmail,
                candidateName,
                employerName: user.user_metadata?.full_name || "Employer",
                jobTitle,
                messageBody: body,
                ctaUrl: `${APP_BASE_URL}/jobseeker/applications/${id}?focus=messages`
              });

              if (emailResult.ok) {
                // C) Update delivery row and message status
                await Promise.all([
                  serviceSupabase
                    .from("message_email_deliveries")
                    .update({ status: 'SENT', resend_id: emailResult.id, sent_at: new Date().toISOString() })
                    .eq("message_id", message.id),
                  supabase
                    .from("application_messages")
                    .update({ status: 'delivered', delivered_at: new Date().toISOString() })
                    .eq("id", message.id)
                ]);
                
                trackEvent('employer_message_email_sent' as any, { applicationId: id, messageId: message.id });
              } else {
                // D) Update delivery row on failure
                await serviceSupabase
                  .from("message_email_deliveries")
                  .update({ status: 'FAILED', error: emailResult.message })
                  .eq("message_id", message.id);
                
                trackEvent('employer_message_email_failed' as any, { applicationId: id, messageId: message.id, error: emailResult.message });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", err.message || "Invalid JSON", 400);
  }
}