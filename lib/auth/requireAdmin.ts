import "server-only";
import { redirect } from "next/navigation";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles";
import { canAccessAdmin } from "@/lib/auth/admin";
import { jsonError } from "@/lib/api/errors";

/**
 * Guard for Admin Pages (React Server Components).
 * Redirects to login if not authorized.
 */
export async function requireAdminPage() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    redirect("/login?error=Supabase not configured");
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?error=Authentication required");
  }

  const role = getUserRole(user);
  if (role !== "admin" || !canAccessAdmin(user.email || "")) {
    redirect("/login?error=Admin access restricted");
  }

  return { supabase, user };
}

/**
 * Guard for Admin API Routes.
 * Returns a NextResponse error if not authorized.
 */
export async function requireAdminApi() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase not configured", 503) };
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: jsonError("UNAUTHORIZED", "Authentication required", 401) };
  }

  const role = getUserRole(user);
  if (role !== "admin" || !canAccessAdmin(user.email || "")) {
    return { error: jsonError("FORBIDDEN", "Admin access restricted", 403) };
  }

  return { supabase, user };
}
