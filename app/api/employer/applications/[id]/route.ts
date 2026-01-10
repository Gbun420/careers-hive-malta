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

  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs(id, title, location),
        candidate:profiles!applications_user_id_fkey(id, full_name, headline, skills, bio, cv_file_path)
      `)
      .eq("id", id)
      .single();

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
        return jsonError("NOT_FOUND", "Applications feature coming soon", 404);
      }
      return jsonError("DB_ERROR", error.message, 500);
    }
    if (!data) return jsonError("NOT_FOUND", "Application not found", 404);

    // Ownership Check: ensure employer owns the job
    if (data.employer_id !== user.id && data.job?.employer_id !== user.id) {
      return jsonError("FORBIDDEN", "Unauthorized access", 403);
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return jsonError("NOT_FOUND", "Applications feature coming soon", 404);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

  // Role check
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'employer' && profile?.role !== 'admin') {
    return jsonError("FORBIDDEN", "Unauthorized access", 403);
  }

  try {
    const { status } = await request.json();
    if (!status) return jsonError("INVALID_INPUT", "Status required", 400);

    const { error } = await supabase
      .from("applications")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
        return jsonError("NOT_FOUND", "Applications feature coming soon", 404);
      }
      return jsonError("DB_ERROR", error.message, 500);
    }

    return NextResponse.json({ success: true });
  } catch {
    return jsonError("BAD_REQUEST", "Invalid JSON", 400);
  }
}