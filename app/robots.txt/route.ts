// app/robots.txt/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /employer/
Disallow: /jobseeker/
Disallow: /setup/

Sitemap: ${baseUrl}/sitemap.xml`;

  return new Response(robots, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
