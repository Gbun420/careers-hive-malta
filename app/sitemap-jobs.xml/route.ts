import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers-hive-malta-prod.vercel.app";
  const supabase = createRouteHandlerClient();

  if (!supabase) {
    return new NextResponse("", { status: 500 });
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1000);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${(jobs || [])
    .map(
      (job) => `
  <url>
    <loc>${baseUrl}/jobs/${job.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
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