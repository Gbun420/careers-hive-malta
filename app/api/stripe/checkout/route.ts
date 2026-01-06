import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { createCheckoutSession, CheckoutProduct } from "@/lib/billing/checkout";

export const runtime = "nodejs";

const BodySchema = z.object({
  companyId: z.string().uuid(),
  jobId: z.string().uuid().optional(),
  product: z.enum(["JOB_POST", "FEATURED_ADDON", "PRO_SUB"]),
});

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required", 401);

  // 1. Validate Input
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("BAD_REQUEST", "Invalid JSON", 400);
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

  const { companyId, jobId, product } = parsed.data;

  // 2. Ownership Check
  if (user.id !== companyId) {
    const role = getUserRole(user);
    if (role !== "admin") return jsonError("FORBIDDEN", "Ownership required", 403);
  }

  // 3. Product Specific Validation
  if ((product === "JOB_POST" || product === "FEATURED_ADDON") && !jobId) {
    return jsonError("INVALID_INPUT", "jobId is required for this product", 400);
  }

  if (jobId) {
    const { data: job } = await supabase
      .from("jobs")
      .select("id, employer_id")
      .eq("id", jobId)
      .eq("employer_id", companyId)
      .maybeSingle();

    if (!job) return jsonError("JOB_NOT_FOUND", "Job not found or not owned by company", 404);
  }

  // 4. Create Session
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const result = await createCheckoutSession({
    companyId,
    jobId,
    product: product as CheckoutProduct,
    customerEmail: user.email,
    origin,
  });

  if ("error" in result) {
    return jsonError(result.error.code, result.error.message, result.error.status);
  }

  return NextResponse.json({ url: result.url });
}
