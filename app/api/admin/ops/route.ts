import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UpdateCheckSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["PENDING", "PASS", "FAIL"]),
  notes: z.string().optional(),
});

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const role = getUserRole(authData.user);
  if (role !== "admin") return jsonError("FORBIDDEN", "Admin access required.", 403);

  const { data, error } = await supabase
    .from("ops_checks")
    .select("*")
    .order("category", { ascending: true })
    .order("key", { ascending: true });

  if (error) return jsonError("DB_ERROR", error.message, 500);

  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  const role = getUserRole(authData.user);
  if (role !== "admin") return jsonError("FORBIDDEN", "Admin access required.", 403);

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
        last_checked_by: authData.user.id,
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
