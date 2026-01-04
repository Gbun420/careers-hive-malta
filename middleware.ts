import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

// --- Inlined Helper Logic ---

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
  if (missing.length > 0) {
    if (
      pathname === "/setup" ||
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
  if (!roleRequired) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareClient(request, response);

  if (!supabase) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  let role = getUserRole(data.user);
  if (role === "admin" && !isAdminAllowedEmail(data.user.email)) {
    role = null;
  }
  if (!role) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
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
