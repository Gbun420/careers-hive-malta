import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  try {
    // Note: verification_status column doesn't exist in production
    // For now, return all employers that are not verified manually yet
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, created_at")
      .eq("role", "employer")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}
