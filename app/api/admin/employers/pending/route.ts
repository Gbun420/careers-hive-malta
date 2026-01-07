import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, headline, created_at")
      .eq("role", "employer")
      .eq("verification_status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}
