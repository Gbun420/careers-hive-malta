import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { parseXmlFeed } from "@/lib/import/xml";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Supabase not configured", { status: 500 });
  }

  const { data: sources, error: sourceError } = await supabase
    .from("job_sources")
    .select("*")
    .eq("enabled", true)
    .eq("type", "XML");

  if (sourceError) {
    return NextResponse.json({ error: sourceError.message }, { status: 500 });
  }

  const results = [];

  for (const source of sources) {
    const runStart = new Date();
    let status = "SUCCESS";
    let importedCount = 0;
    let updatedCount = 0; 
    let skippedCount = 0;
    let errorMsg = null;

    try {
      const response = await fetch(source.feed_url);
      if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
      const xmlText = await response.text();
      
      const normalizedJobs = await parseXmlFeed(xmlText, source.mapping);
      
      // Upsert batch
      const dbJobs = normalizedJobs.map(job => ({
        source_id: source.id,
        external_id: job.external_id,
        title: job.title,
        description: job.description,
        company_name: job.company_name,
        location: job.location,
        url: job.url,
        apply_url: job.apply_url,
        posted_at: job.posted_at || new Date().toISOString(),
        valid_through: job.valid_through,
        is_active: true
      }));

      if (dbJobs.length > 0) {
          const { error: upsertError } = await supabase
            .from("jobs")
            .upsert(dbJobs, { onConflict: 'source_id,external_id' });
          
          if (upsertError) throw upsertError;
          importedCount = dbJobs.length; 
      }
      
    } catch (e: any) {
      status = "FAILED";
      errorMsg = e.message;
    }

    await supabase.from("job_import_runs").insert({
        source_id: source.id,
        started_at: runStart.toISOString(),
        finished_at: new Date().toISOString(),
        status,
        imported_count: importedCount,
        updated_count: updatedCount,
        skipped_count: skippedCount,
        error: errorMsg
    });

    results.push({ source: source.name, status, importedCount, error: errorMsg });
  }

  return NextResponse.json({ results });
}
