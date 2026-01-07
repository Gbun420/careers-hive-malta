import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient, createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { sendEmail } from "@/lib/email/sender"; // Using existing sender utility

export const runtime = "nodejs";

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

    // 2. Fetch candidate email for notification (if sender is employer)
    if (sender_role === 'EMPLOYER') {
      const serviceSupabase = createServiceRoleClient();
      if (serviceSupabase) {
                  const { data: appData } = await serviceSupabase
                  .from("applications")
                  .select("user_id, job:jobs(title)")
                  .eq("id", id)
                  .single();
                
                if (appData) {
                  const { data: userData } = await serviceSupabase.auth.admin.getUserById(appData.user_id);
                  const candidateEmail = userData.user?.email;
                  const jobTitle = (appData.job as any)?.title || "your application";
        
                  if (candidateEmail) {
                    const emailResult = await sendEmail(
                      candidateEmail,
                      `New message regarding ${jobTitle}`,
                      `<p>You have a new message from the employer.</p><p><strong>Message:</strong></p><blockquote>${body}</blockquote><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/jobseeker/notifications">View and reply here</a></p>`
                    );
            if (emailResult.ok) {
              // 3. Update status to 'delivered'
              await supabase
                .from("application_messages")
                .update({ status: 'delivered', delivered_at: new Date().toISOString() })
                .eq("id", message.id);
              
              message.status = 'delivered';
              message.delivered_at = new Date().toISOString();
            } else {
              // Update status to 'failed'
              await supabase
                .from("application_messages")
                .update({ status: 'failed' })
                .eq("id", message.id);
              
              message.status = 'failed';
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