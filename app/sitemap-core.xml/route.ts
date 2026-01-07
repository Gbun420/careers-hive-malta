// app/sitemap-core.xml/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function urlEntry(loc: string, lastmod?: string) {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";
  const now = new Date().toISOString();

  const staticUrls = [
    `${baseUrl}/`,
    `${baseUrl}/jobs`,
    `${baseUrl}/pricing`,
    `${baseUrl}/for-employers`,
    `${baseUrl}/blog`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((u) => urlEntry(u, now)).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
