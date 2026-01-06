import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { secondMeEnabled } from "@/lib/flags";
import { GenerateRequestSchema, OutputSchemas } from "@/lib/second-me/types";
import { generateInputHash } from "@/lib/second-me/hash";
import { checkAndIncrementRateLimit } from "@/lib/second-me/rate-limit";
import { getAIProvider } from "@/lib/second-me/provider";
import { buildPrompt } from "@/lib/second-me/prompts";
import { trackEvent } from "@/lib/analytics";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!secondMeEnabled) {
    return jsonError("FORBIDDEN", "Second Me is not enabled.", 403);
  }

  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  // 1. Check Settings & Consent
  const { data: settings } = await supabase
    .from("second_me_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!settings?.enabled || !settings?.consent_at) {
    return jsonError("SECOND_ME_NOT_ENABLED", "You must opt-in to use Second Me.", 403);
  }

  // 2. Validate Request
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("BAD_REQUEST", "Invalid JSON", 400);
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

  const { jobId, type } = parsed.data;

  // 3. Fetch Context
  const [{ data: job }, { data: profile }] = await Promise.all([
    supabase.from("jobs").select("title, description").eq("id", jobId).single(),
    supabase.from("profiles").select("headline, skills, bio, experience").eq("id", user.id).single(),
  ]);

  if (!job) return jsonError("JOB_NOT_FOUND", "Job not found", 404);
  if (!profile) return jsonError("NOT_FOUND", "User profile not found", 404);

  // 4. Check Cache
  const inputHash = generateInputHash({
    userId: user.id,
    jobId,
    type,
    userProfile: profile,
    jobData: job,
    settings
  });

  const { data: cachedOutput } = await supabase
    .from("second_me_outputs")
    .select("content")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .eq("type", type)
    .eq("input_hash", inputHash)
    .maybeSingle();

  if (cachedOutput) {
    trackEvent('alert_digest_sent' as any, { type, cached: true }); // Using existing type for now or any
    return NextResponse.json({ output: cachedOutput.content, cached: true });
  }

  // 5. Check Rate Limit
  const rateLimitResult = await checkAndIncrementRateLimit(supabase, user.id);
  if (!rateLimitResult.ok) {
    return jsonError("RATE_LIMITED", "Daily generation limit reached.", 429, {
      limit: rateLimitResult.limit,
      remaining: 0
    });
  }

  // 6. Generate
  try {
    const provider = getAIProvider();
    const prompt = buildPrompt(type, job, profile, settings);
    const content = await provider.generate(type, prompt);

    // 7. Store Output
    await supabase.from("second_me_outputs").upsert({
      user_id: user.id,
      job_id: jobId,
      type,
      input_hash: inputHash,
      content,
      cached: false
    });

    trackEvent('alert_digest_sent' as any, { type, cached: false });

    return NextResponse.json({ output: content, cached: false });
  } catch (err: any) {
    console.error("AI Generation failed:", err);
    return jsonError("DB_ERROR", "AI generation failed. Please try again later.", 500);
  }
}
