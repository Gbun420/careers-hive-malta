import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { canSignupAsAdmin } from "@/lib/auth/admin";
import { z } from "zod";
import { SITE_URL } from "@/lib/site/url";

export const runtime = "nodejs";

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["jobseeker", "employer", "admin"]),
});

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503);

  try {
    const body = await request.json();
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) return jsonError("INVALID_INPUT", parsed.error.errors[0]?.message, 400);

    const { email, password, role } = parsed.data;

    // Security: Check if admin signup is actually allowed for this email
    if (role === "admin" && !canSignupAsAdmin(email)) {
      return jsonError("FORBIDDEN", "Admin registration restricted.", 403);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      // Check for specifically "User already registered"
      if (error.status === 400 && error.message.includes("already registered")) {
          return jsonError("INVALID_INPUT", "An account with this email already exists.", 400);
      }
      return jsonError("BAD_REQUEST", error.message, 400);
    }

    return NextResponse.json({ 
      data: {
        id: data.user?.id,
        email: data.user?.email,
        confirmation_sent: !data.session // If no session, email confirmation is required
      }
    }, { status: 201 });

  } catch (err: any) {
    return jsonError("BAD_REQUEST", err.message || "Invalid JSON", 400);
  }
}