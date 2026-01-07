// app/sitemap.xml/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";

  const sitemaps = [
    `${baseUrl}/sitemap-core.xml`,
    `${baseUrl}/sitemap-jobs.xml`,
    `${baseUrl}/sitemap-categories.xml`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
    .map(
      (url) => `  <sitemap>
    <loc>${url}</loc>
  </sitemap>`
    )
    .join("\n")}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}