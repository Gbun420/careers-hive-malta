import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

  const { data: settings } = await supabase
    .from("second_me_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: usage } = await supabase
    .from("second_me_usage_daily")
    .select("count")
    .eq("user_id", user.id)
    .eq("day", new Date().toISOString().split("T")[0])
    .maybeSingle();

  return NextResponse.json({ 
    settings: settings || { enabled: false, tone: 'professional', language: 'en' },
    usage: usage?.count || 0
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

  try {
    const body = await request.json();
    const update: any = {
      updated_at: new Date().toISOString()
    };

    if (body.enabled !== undefined) {
      update.enabled = body.enabled;
      if (body.enabled) update.consent_at = new Date().toISOString();
    }
    if (body.tone) update.tone = body.tone;
    if (body.language) update.language = body.language;

    const { data, error } = await supabase
      .from("second_me_settings")
      .upsert({ user_id: user.id, ...update })
      .select()
      .single();

    if (error) return jsonError("DB_ERROR", error.message, 500);

    return NextResponse.json({ data });
  } catch {
    return jsonError("BAD_REQUEST", "Invalid JSON", 400);
  }
}

export async function DELETE() {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

  // 1. Disable feature
  await supabase
    .from("second_me_settings")
    .update({ enabled: false, consent_at: null })
    .eq("user_id", user.id);

  // 2. Wipe outputs (GDPR compliance)
  await supabase
    .from("second_me_outputs")
    .delete()
    .eq("user_id", user.id);

  trackEvent('alert_disabled' as any, { method: 'data_wipe' });

  return NextResponse.json({ success: true });
}
