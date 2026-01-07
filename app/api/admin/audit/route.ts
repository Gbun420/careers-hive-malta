import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { jsonError } from "@/lib/api/errors";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "50");
  const action = searchParams.get("action");
  const actor = searchParams.get("actor");

  const adminAuth = await requireAdminApi();
  if ("error" in adminAuth) return adminAuth.error;
  const { supabase } = adminAuth;

  try {
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (action) {
      query = query.ilike("action", `%${action}%`);
    }
    
    if (actor) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(actor);
      if (isUuid) {
        query = query.or(`actor_email.ilike.%${actor}%,actor_id.eq.${actor}`);
      } else {
        query = query.ilike("actor_email", `%${actor}%`);
      }
    }

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({ 
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    });
  } catch (err: any) {
    return jsonError("DB_ERROR", err.message, 500);
  }
}