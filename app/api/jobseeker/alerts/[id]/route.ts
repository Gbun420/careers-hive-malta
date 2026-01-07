import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { UpdateJobAlertSchema } from "@/lib/alerts/types";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  try {
    const body = await request.json();
    const parsed = UpdateJobAlertSchema.safeParse(body);
    if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

    const { data, error } = await supabase
      .from("job_alerts")
      .update({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return jsonError("DB_ERROR", error.message, 500);

    trackEvent('alert_updated' as any, { alert_id: id });
    if (parsed.data.enabled === false) {
      trackEvent('alert_disabled' as any, { alert_id: id });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const { error } = await supabase
    .from("job_alerts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return jsonError("DB_ERROR", error.message, 500);

  return NextResponse.json({ success: true });
}
