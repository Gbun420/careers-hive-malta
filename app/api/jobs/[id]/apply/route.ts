import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ApplySchema = z.object({
  cover_letter: z.string().trim().max(5000).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: jobId } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const userId = authData.user.id;

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    body = {}; // Optional body
  }

  const parsed = ApplySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  // Check if job exists and is active
  const { data: job } = await supabase
    .from("jobs")
    .select("id, is_active")
    .eq("id", jobId)
    .single();

  if (!job || !job.is_active) {
    return jsonError("NOT_FOUND", "Job not found or no longer active.", 404);
  }

  // Insert application (Unique constraint handles duplicate prevention)
  const { data, error } = await supabase
    .from("applications")
    .insert({
      job_id: jobId,
      user_id: userId,
      cover_letter: parsed.data.cover_letter,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return jsonError("DUPLICATE_APPLICATION", "You have already applied for this job.", 409);
    }
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data });
}
