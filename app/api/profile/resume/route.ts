import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { parseResumeText } from "@/lib/jobs/parser";
import { logAudit } from "@/lib/audit/log";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Endpoint to parse resume text.
 * In a real app, this would also support file uploads (PDF/DOCX).
 */
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  if (!body.text || body.text.length < 50) {
    return jsonError("INVALID_INPUT", "Resume text is too short or missing.", 400);
  }

  const parsedData = parseResumeText(body.text);

  // Log the parsing event
  await logAudit({
    actorId: authData.user.id,
    action: "resume_parsed",
    entityType: "resume",
    entityId: authData.user.id, // Using user_id as a proxy for the resume entity for now
    meta: {
      skills_count: parsedData.skills.length,
      has_experience: !!parsedData.experienceYears,
    },
  });

  return NextResponse.json({ data: parsedData });
}
