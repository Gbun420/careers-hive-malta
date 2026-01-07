import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { publishIndexingNotification, IndexingNotificationType } from "@/lib/google/indexing";
import { z } from "zod";

export const runtime = "nodejs";

const BodySchema = z.object({
  url: z.string().url(),
  type: z.enum(["URL_UPDATED", "URL_DELETED"] as const),
});

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Auth required", 401);

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return jsonError("FORBIDDEN", "Admin access required", 403);
  }

  try {
    const body = await request.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

    const { url, type } = parsed.data;

    // Use jobId if it's a job detail page (optional)
    let jobId: string | undefined;
    if (url.includes("/jobs/")) {
        const parts = url.split("/jobs/");
        jobId = parts[parts.length - 1];
    }

    await publishIndexingNotification(url, type, jobId);

    return NextResponse.json({ ok: true, message: `Notification sent for ${url}` });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", err.message || "Invalid request", 400);
  }
}
