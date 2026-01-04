import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { requireDevSecret } from "@/lib/dev/guard";


export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const dev = requireDevSecret(request);
  if (!dev.ok) {
    return dev.response;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return jsonError("BAD_REQUEST", "Invalid JSON body", 400);
  }

  const { email, password } = payload as { email?: string; password?: string };
  
  if (!email || !password) {
    return jsonError("BAD_REQUEST", "Email and password required", 400);
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return jsonError("UNAUTHORIZED", error.message, 401);
  }

  if (!data.session?.access_token || !data.user?.id) {
    return jsonError("UNAUTHORIZED", "Failed to authenticate", 401);
  }

  return NextResponse.json({
    access_token: data.session.access_token,
    token_type: "bearer",
    user_id: data.user.id,
  });
}
