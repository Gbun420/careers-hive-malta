import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/server";
import { getMissingSupabaseEnv } from "@/lib/auth/session";
import { getDashboardPath, getRoleFromPath, getUserRole } from "@/lib/auth/roles";
import { isAdminAllowedEmail } from "@/lib/auth/admin";

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
      pathname.startsWith("/employer/jobs") ||
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
