// app/sitemap-categories.xml/route.ts
import { CATEGORY_MAP, LOCATION_MAP } from "@/lib/seo/slugs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function urlEntry(loc: string) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";
  const categories = Object.keys(CATEGORY_MAP);
  const locations = Object.keys(LOCATION_MAP);

  const urls: string[] = [];

  for (const cat of categories) {
    urls.push(urlEntry(`${baseUrl}/jobs/${cat}`));
    for (const loc of locations) {
      if (loc !== "malta") {
        urls.push(urlEntry(`${baseUrl}/jobs/${cat}/${loc}`));
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
