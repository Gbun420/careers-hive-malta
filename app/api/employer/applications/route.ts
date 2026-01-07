import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return NextResponse.json({ error: "Config error" }, { status: 500 });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  // Attempt to select related data.
  // We rely on RLS policies ("Employers can view applications for their jobs") 
  // to ensure the employer only sees applications for roles they own.
  let query = supabase
    .from("applications")
    .select(`
        *,
        job:jobs(id, title),
        candidate:profiles!user_id(id, full_name, headline, skills)
    `);

  if (jobId) {
      query = query.eq("job_id", jobId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error("Applications query error:", error);
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data: data || [] });
}