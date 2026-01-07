import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateCheckSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING", "PASS", "FAIL"]),
  notes: z.string().optional(),
});

export async function GET() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  const { data, error } = await supabase
    .from("ops_checks")
    .select("*")
    .order("category", { ascending: true })
    .order("key", { ascending: true });

  if (error) return jsonError("DB_ERROR", error.message, 500);

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase, user: adminUser } = adminAuth;

  try {
    const body = await request.json();
    const parsed = UpdateCheckSchema.safeParse(body);
    if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

    const { id, status, notes } = parsed.data;

    const { data, error } = await supabase
      .from("ops_checks")
      .update({
        status,
        notes,
        last_checked_at: new Date().toISOString(),
        last_checked_by: adminUser.id,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return jsonError("DB_ERROR", error.message, 500);

    return NextResponse.json({ data });
  } catch (err: any) {
    return jsonError("BAD_REQUEST", err.message || "Invalid JSON", 400);
  }
}