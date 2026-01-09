import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  try {
    let query = supabase
      .from("job_reports")
      .select(`
        *,
        job:jobs (id, title, employer:profiles (id, full_name))
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status.toLowerCase());
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}