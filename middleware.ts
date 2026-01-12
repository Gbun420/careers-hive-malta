import { NextResponse, type NextRequest } from "next/server";

// --- Optimized Constants ---
const ASSET_EXT = /\.(?:png|jpg|jpeg|gif|webp|svg|ico|txt|xml|css|js|map|woff2?|ttf|eot)$/i;
const REQUIRED_ENV = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
const PROTECTED_PREFIXES = ["/settings", "/profile"] as const;
const ROLE_PREFIXES = ["/jobseeker", "/employer", "/admin"] as const;

// --- Optimized Helpers ---
const getMissingEnv = (): string[] => REQUIRED_ENV.filter((key) => !process.env[key]);

const getRoleFromPath = (pathname: string): string | null =>
  ROLE_PREFIXES.find((prefix) => pathname.startsWith(prefix)) || null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowerPath = pathname.toLowerCase();

  // 1. Legacy path normalization FIRST (handles dot-paths like /Careers.mt)
  if (lowerPath === "/careers.mt" || lowerPath === "/careers.mt/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url, 308);
  }

  // 2. Absolute early return for APIs and real static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || ASSET_EXT.test(pathname)) {
    return NextResponse.next();
  }

  // 3. Production Canonical Host Redirect
  if (process.env.VERCEL_ENV === "production") {
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    // Handle empty string or missing protocol
    if (!siteUrl || !siteUrl.startsWith("http")) {
      siteUrl = "https://careers-hive-malta-prod.vercel.app";
    }

    // Sanitize common typos in siteUrl (like .vercel.appy)
    if (siteUrl.includes(".vercel.appy")) {
      siteUrl = siteUrl.replace(".vercel.appy", ".vercel.app");
    }

    try {
      const canonicalUrl = new URL(siteUrl);
      const canonicalHost = canonicalUrl.host;
      const requestHost = request.headers.get("host");

      if (requestHost && requestHost !== canonicalHost) {
        const url = request.nextUrl.clone();
        url.protocol = "https:";
        url.host = canonicalHost;
        url.port = ""; // Ensure standard port
        return NextResponse.redirect(url, 308);
      }
    } catch (e) {
      // If URL parsing fails, skip redirect to prevent 500 error
      console.error("Failed to parse canonical URL:", siteUrl);
    }
  }

  const isLocal =
    request.headers.get("host")?.includes("localhost") ||
    request.headers.get("host")?.includes("127.0.0.1");

  const missing = getMissingEnv();

  /* Removed production block for setup to allow viewing Stripe/Meili status */
  /*
  if (!isLocal && process.env.NODE_ENV === "production" && missing.length === 0 && (pathname === "/setup" || pathname.startsWith("/setup/"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  */

  // Only force /setup if NOT local
  if (!isLocal && missing.length > 0) {
    const isSetupPath = pathname === "/setup" || pathname.startsWith("/setup/");
    if (isSetupPath || pathname.startsWith("/jobs")) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  const roleRequired = getRoleFromPath(pathname);
  const isProtectedRoute =
    roleRequired || PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Lightweight Auth Check: Look for Supabase auth cookies (prefix 'sb-')
  const hasAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));

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
  matcher: [
    "/Careers.mt",
    "/careers.mt",
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
