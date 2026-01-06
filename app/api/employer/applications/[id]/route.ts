import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const StatusUpdateSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'interviewing', 'rejected', 'offered']),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return jsonError("UNAUTHORIZED", "Authentication required.", 401);
  }

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return jsonError("INVALID_INPUT", "Invalid JSON body.", 400);
  }

  const parsed = StatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);
  }

  // RLS handles checking if this employer owns the job for this application
  const { data, error } = await supabase
    .from("applications")
    .update({ 
      status: parsed.data.status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  return NextResponse.json({ data });
}
