// app/sitemap.xml/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeXml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlEntry(loc: string, lastmod?: string) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""}
  </url>`;
}

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://careers.mt";

  const staticUrls = [
    `${baseUrl}/`,
    `${baseUrl}/jobs`,
    `${baseUrl}/pricing`,
    `${baseUrl}/for-employers`,
    `${baseUrl}/blog`,
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fallback: if Supabase isn't configured, ship a minimal sitemap (no crash).
  if (!supabaseUrl || !supabaseAnon) {
    const now = new Date().toISOString();
    const urlsXml = staticUrls.map((u) => urlEntry(u, now)).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  // Supabase configured: add job URLs (limit to avoid huge sitemaps).
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false },
  });

  // NOTE: adjust table/columns if your schema differs.
  const { data, error } = await supabase
    .from("jobs")
    .select("id, updated_at")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (error) {
    // Do not fail sitemap if DB query fails — still return static sitemap.
    const now = new Date().toISOString();
    const urlsXml = staticUrls.map((u) => urlEntry(u, now)).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
    return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
  }

  const now = new Date().toISOString();
  const jobUrls = (data ?? []).map((j: any) =>
    urlEntry(`${baseUrl}/jobs/${j.id}`, j.updated_at ? new Date(j.updated_at).toISOString() : undefined)
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map((u) => urlEntry(u, now)).join("\n")} 
${jobUrls.length ? "\n" + jobUrls.join("\n") : ""}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
