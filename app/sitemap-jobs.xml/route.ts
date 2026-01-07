// app/sitemap-jobs.xml/route.ts
import { createServiceRoleClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function urlEntry(loc: string, lastmod?: string) {
  return `  <url>
    <loc>${loc}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>`;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://careers.mt";
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { "Content-Type": "application/xml" }
    });
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, updated_at")
    .eq("is_active", true)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(5000);

  const jobUrls = (jobs || []).map((j) =>
    urlEntry(`${baseUrl}/jobs/${j.id}`, j.updated_at ? new Date(j.updated_at).toISOString() : undefined)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${jobUrls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
