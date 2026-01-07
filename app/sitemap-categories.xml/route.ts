import { NextResponse } from "next/server";
import { jobBoardConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers-hive-malta-prod.vercel.app";

  const categories = jobBoardConfig.industries;
  const locations = jobBoardConfig.locations;

  const urls: string[] = [];

  // Category URLs
  categories.forEach((cat) => {
    urls.push(`${baseUrl}/jobs/${cat.toLowerCase().replace(/\s+/g, "-")}`);
  });

  // Location URLs
  locations.forEach((loc) => {
    urls.push(`${baseUrl}/jobs/malta/${loc.toLowerCase().replace(/\s+/g, "-")}`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .map(
      (url) => `
  <url>
    <loc>${url}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
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
