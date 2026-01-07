import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site/url";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = SITE_URL;

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-core.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-jobs.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
