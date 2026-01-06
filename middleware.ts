import { NextResponse, type NextRequest } from "next/server";

// --- Lightweight Helpers (No Supabase Imports) ---

function getMissingSupabaseEnv(): string[] {
  const requiredEnv = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];
  return requiredEnv.filter((key) => !process.env[key]);
}

function isStaticAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

function getRoleFromPath(pathname: string): string | null {
  if (pathname.startsWith("/jobseeker")) return "jobseeker";
  if (pathname.startsWith("/employer")) return "employer";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
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

  // Lightweight Auth Check: Look for Supabase auth cookies
  // Supabase SSR cookies typically start with 'sb-'
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(cookie => cookie.name.startsWith('sb-'));

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Session exists (at least a cookie does). 
  // We allow the request to proceed to the Page (Node.js context) 
  // where actual role verification and session validation will happen securely.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};