import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site/url";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = SITE_URL;

  const pages = ["", "/jobs", "/pricing", "/blog", "/for-employers"];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}