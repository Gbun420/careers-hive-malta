import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { getUserRole } from "@/lib/auth/roles";
import { isAdminAllowedEmail } from "@/lib/auth/admin";

export async function requireAdmin() {
  const supabase = createRouteHandlerClient();
  if (!supabase) {
    return { supabase: null, error: jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503) };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { supabase: null, error: jsonError("UNAUTHORIZED", "Authentication required.", 401) };
  }

  const role = getUserRole(authData.user);
  if (role !== "admin" || !isAdminAllowedEmail(authData.user.email)) {
    return { supabase: null, error: jsonError("FORBIDDEN", "Admin access required.", 403) };
  }

  return { supabase, user: authData.user };
}
