import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { SavedSearchCreateSchema } from "@/lib/alerts/criteria";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {

  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "jobseeker" && role !== "admin") {
    return jsonError("FORBIDDEN", "Jobseeker or Admin access required.", 403);
  }

  // Reading from job_alerts table (JBoard parity)
  const { data, error } = await supabase
    .from("job_alerts")
    .select("id, created_at, frequency, filters, query")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  // Map back to expected UI format
  const mappedData = data?.map((alert) => ({
    id: alert.id,
    created_at: alert.created_at,
    frequency: alert.frequency.toLowerCase(),
    search_criteria: {
      keywords: alert.query,
      ...alert.filters,
    },
  }));

  return NextResponse.json({ data: mappedData });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  const role = getUserRole(authData.user);
  if (role !== "jobseeker" && role !== "admin") {
    return jsonError("FORBIDDEN", "Jobseeker or Admin access required.", 403);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = SavedSearchCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  // Map to job_alerts
  const query = parsed.data.search_criteria.keywords;
  const { keywords, ...filters } = parsed.data.search_criteria; // Extract keywords to store separately
  
  // Map frequency: UI supports instant, daily, weekly. DB supports DAILY, WEEKLY.
  // We'll treat 'instant' as 'DAILY' for the cron job, or maybe we need 'INSTANT' support later.
  // For JBoard parity (Digest), Daily is standard.
  const frequency = parsed.data.frequency === "weekly" ? "WEEKLY" : "DAILY";

  const { data, error } = await supabase
    .from("job_alerts")
    .insert({
      user_id: authData.user.id,
      query: query || null,
      filters: filters,
      frequency: frequency,
    })
    .select("id, created_at, frequency, filters, query")
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  // Map back for response
  const mappedData = {
    id: data.id,
    created_at: data.created_at,
    frequency: data.frequency.toLowerCase(),
    search_criteria: {
      keywords: data.query,
      ...data.filters,
    },
  };

  return NextResponse.json({ data: mappedData }, { status: 201 });
}