import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { CreateJobAlertSchema } from "@/lib/alerts/types";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const { data, error } = await supabase
    .from("job_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return jsonError("DB_ERROR", error.message, 500);

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  try {
    const body = await request.json();
    const parsed = CreateJobAlertSchema.safeParse(body);
    if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

    const { data, error } = await supabase
      .from("job_alerts")
      .insert({
        ...parsed.data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return jsonError("INVALID_INPUT", "An alert with this name already exists.", 400);
      return jsonError("DB_ERROR", error.message, 500);
    }

    trackEvent('alert_created' as any, { alert_id: data.id, frequency: data.frequency });

    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", "Invalid JSON body.", 400);
  }
}
