import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";
import { publishIndexingNotification } from "@/lib/google/indexing";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  url: z.string().url(),
  type: z.enum(["URL_UPDATED", "URL_DELETED"] as const),
});

export async function POST(request: NextRequest) {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;

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