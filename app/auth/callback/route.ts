import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient();
    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
      }
      if (data.user) {
        // --- Role-based redirection logic ---
        const role = data.user.user_metadata?.role;
        const email = data.user.email;

        // Admin check (sync with lib/auth/admin.ts logic)
        const allowAdminSignup = process.env.ALLOW_ADMIN_SIGNUP === "true";
        const rawAllowlist = process.env.ADMIN_ALLOWLIST ?? "";
        const adminAllowlist = rawAllowlist
          .split(",")
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean);

        if (role === "admin") {
          const isAllowed = allowAdminSignup && email && adminAllowlist.includes(email.toLowerCase());
          if (!isAllowed) {
            // Sign out if admin role is not authorized
            await supabase.auth.signOut();
            return NextResponse.redirect(`${requestUrl.origin}/login?error=Admin access restricted`);
          }
          return NextResponse.redirect(`${requestUrl.origin}/admin/dashboard`);
        }

        if (role === "employer") {
          return NextResponse.redirect(`${requestUrl.origin}/employer/dashboard`);
        }

        // Default to jobseeker
        return NextResponse.redirect(`${requestUrl.origin}/jobseeker/dashboard`);
      }
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`);
}
