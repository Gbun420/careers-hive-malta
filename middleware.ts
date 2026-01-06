import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type SupabaseClient } from "@supabase/supabase-js";

// --- Inlined Helper Logic ---

// From lib/supabase/middleware.ts
function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({
              name,
              value,
              ...options,
            });
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          });
        },
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase middleware client:", error);
    return null;
  }
}

// From lib/auth/session.ts
const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

function getMissingSupabaseEnv(): string[] {
  return requiredEnv.filter((key) => !process.env[key]);
}

// From lib/auth/roles.ts
const roles = ["jobseeker", "employer", "admin"] as const;
type UserRole = (typeof roles)[number];

function getDashboardPath(role: UserRole): string {
  return `/${role}/dashboard`;
}

function getRoleFromPath(pathname: string): UserRole | null {
  if (pathname.startsWith("/jobseeker")) {
    return "jobseeker";
  }
  if (pathname.startsWith("/employer")) {
    return "employer";
  }
  if (pathname.startsWith("/admin")) {
    return "admin";
  }
  return null;
}

function getUserRole(user: { user_metadata?: Record<string, unknown> | null } | null): UserRole | null {
  if (!user?.user_metadata) {
    return null;
  }
  const role = user.user_metadata.role;
  return (typeof role === "string" && roles.includes(role as UserRole)) ? (role as UserRole) : null;
}

// From lib/auth/admin.ts
const allowAdminSignup = process.env.ALLOW_ADMIN_SIGNUP === "true";
const rawAllowlist = process.env.ADMIN_ALLOWLIST ?? "";
const adminAllowlist = rawAllowlist
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

function isAdminAllowedEmail(email?: string | null): boolean {
  if (!allowAdminSignup) {
    return false;
  }
  if (!email) {
    return false;
  }
  return adminAllowlist.includes(email.toLowerCase());
}

// --- End Inlined Logic ---

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const missing = getMissingSupabaseEnv();
  
  // Block setup in production if configured
  if (process.env.NODE_ENV === "production" && missing.length === 0 && (pathname === "/setup" || pathname.startsWith("/setup/"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (missing.length > 0) {
    const isSetupPath = pathname === "/setup" || pathname.startsWith("/setup/");
    if (
      isSetupPath ||
      pathname.startsWith("/jobseeker/alerts") ||
      pathname.startsWith("/jobseeker/notifications") ||
      pathname.startsWith("/employer/jobs") ||
      pathname.startsWith("/employer/verification") ||
      pathname.startsWith("/admin/verifications") ||
      pathname.startsWith("/admin/reports") ||
      pathname.startsWith("/admin/audit") ||
      pathname.startsWith("/jobs")
    ) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  const roleRequired = getRoleFromPath(pathname);
  const isProtectedRoute = roleRequired || pathname.startsWith("/settings") || pathname.startsWith("/profile");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient(request, response);

  if (!supabase) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("Supabase getUser failed:", error);
    // Treat as unauthenticated
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  let role = getUserRole(user);
  if (role === "admin" && !isAdminAllowedEmail(user.email)) {
    role = null;
  }
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin Override: Allow admins to access any role-required path
  if (role === "admin") {
    return response;
  }

  if (role !== roleRequired) {
    const url = request.nextUrl.clone();
    url.pathname = getDashboardPath(role);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
