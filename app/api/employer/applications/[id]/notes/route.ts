import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { z } from "zod";

export const runtime = "nodejs";

const NoteSchema = z.object({
  body: z.string().min(2).max(2000),
  pinned: z.boolean().optional(),
});

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
    .from("application_notes")
    .select(`
      *,
      author:profiles!author_user_id(full_name)
    `)
    .eq("application_id", id)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

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
    const payload = await request.json();
    const parsed = NoteSchema.safeParse(payload);
    if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0].message, 400);

    const { data, error } = await supabase
      .from("application_notes")
      .insert({
        application_id: id,
        author_user_id: user.id,
        body: parsed.data.body,
        pinned: parsed.data.pinned || false,
      })
      .select(`
        *,
        author:profiles!author_user_id(full_name)
      `)
      .single();

    if (error) return jsonError("DB_ERROR", error.message, 500);

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return jsonError("BAD_REQUEST", "Invalid JSON", 400);
  }
}