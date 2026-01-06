import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return NextResponse.json({ error: "Config error" }, { status: 500 });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  // Attempt to select related data. Note: Relation to profiles requires FK or explicit join hint.
  // Since applications.user_id references auth.users, and profiles.id references auth.users, 
  // they share ID. PostgREST might not infer this without an explicit FK between applications.user_id and profiles.id.
  // However, we can try. If it fails, we return raw applications.
  
  let query = supabase
    .from("applications")
    .select(`
        *,
        job:jobs(title)
    `)
    .eq("employer_id", user.id); 

  if (jobId) {
      query = query.eq("job_id", jobId);
  }

  const { data, error } = await query;
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}