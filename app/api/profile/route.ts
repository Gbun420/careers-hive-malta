import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { z } from "zod";
import { logAudit } from "@/lib/audit/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ProfileUpdateSchema = z.object({
  full_name: z.string().trim().min(2).max(100).optional(),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  experience: z.array(z.any()).optional(),
  education: z.array(z.any()).optional(),
  skills: z.array(z.string()).optional(),
});

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, headline, bio, experience, education, skills, created_at")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    return jsonError("DB_ERROR", profileError.message, 500);
  }

  if (!profile) {
    // Return a skeleton profile if not found yet (e.g. trigger delay)
    return NextResponse.json({
      data: {
        id: authData.user.id,
        email: authData.user.email,
        role: authData.user.user_metadata?.role || "jobseeker",
        full_name: authData.user.user_metadata?.full_name || "",
        headline: "",
        bio: "",
        experience: [],
        education: [],
        skills: [],
        created_at: new Date().toISOString(),
      },
    });
  }

  return NextResponse.json({ data: profile });
}

export async function PATCH(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = ProfileUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  const { data: profile, error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      headline: parsed.data.headline,
      bio: parsed.data.bio,
      experience: parsed.data.experience,
      education: parsed.data.education,
      skills: parsed.data.skills,
    })
    .eq("id", authData.user.id)
    .select("id, role, full_name, headline, bio, experience, education, skills, created_at")
    .single();

  if (updateError) {
    return jsonError("DB_ERROR", updateError.message, 500);
  }

  // Log the profile update
  await logAudit({
    actorId: authData.user.id,
    actorEmail: authData.user.email || "",
    action: "profile_updated",
    entityType: "profile",
    entityId: profile.id,
    metadata: {
      updated_fields: Object.keys(parsed.data),
    },
  });

  return NextResponse.json({ data: profile });
}