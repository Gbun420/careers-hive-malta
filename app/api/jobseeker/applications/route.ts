import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export const runtime = "nodejs";

export async function GET() {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("UNAUTHORIZED", "Authentication required.", 401);

  // Fetch applications with joined job details
  try {
    const { data, error } = await supabase
      .from("applications")
      .select(`
        id,
        status,
        created_at,
        updated_at,
        job:jobs(
          id,
          title,
          location,
          company_name,
          company_id
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("schema cache") || msg.includes("does not exist") || msg.includes("relation")) {
        return NextResponse.json({ data: [], _notice: "Applications feature coming soon" });
      }
      console.error("Fetch jobseeker applications error:", error);
      return jsonError("DB_ERROR", error.message, 500);
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: any) {
    return NextResponse.json({ data: [], _notice: "Applications feature coming soon" });
  }
}
