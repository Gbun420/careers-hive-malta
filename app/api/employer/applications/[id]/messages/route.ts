import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

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

    const { data, error } = await supabase
      .from("application_messages")
      .insert({
        application_id: id,
        sender_role,
        body
      })
      .select()
      .single();

    if (error) return jsonError("DB_ERROR", error.message, 500);

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return jsonError("BAD_REQUEST", "Invalid JSON", 400);
  }
}
