import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { XMLParser } from "fast-xml-parser";
import { createHash } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("x-cron-secret");
  if (authHeader !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response("Supabase not configured", { status: 500 });
  }

  // 1. Fetch enabled sources
  const { data: sources, error: sourcesError } = await supabase
    .from("aggregated_job_sources")
    .select("*")
    .eq("enabled", true);

  if (sourcesError) {
    return NextResponse.json({ error: sourcesError.message }, { status: 500 });
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const overallResults = {
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
  };

  for (const source of sources || []) {
    const runId = crypto.randomUUID();
    const startTime = new Date().toISOString();
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let runError = null;

    try {
      if (source.type === "RSS") {
        const res = await fetch(source.url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
        const xml = await res.text();
        const data = parser.parse(xml);
        
        // Handle common RSS structures (rss.channel.item or feed.entry)
        const items = data.rss?.channel?.item || data.feed?.entry || [];
        const itemsArr = Array.isArray(items) ? items : [items];

        for (const item of itemsArr) {
          const title = item.title || "";
          const sourceUrl = item.link || item.id || "";
          const description = item.description || item.content || item.summary || "";
          const pubDate = item.pubDate || item.updated || item.published || new Date().toISOString();
          const location = item.location || "";
          const companyName = item.company || item.author?.name || "Unknown";
          
          // Apply URL
          const applyUrl = sourceUrl;

          if (!title || !sourceUrl) {
            skipped++;
            continue;
          }

          // Compute canonical_hash
          const canonicalString = `${source.id}|${title}|${applyUrl}|${location}`;
          const canonicalHash = createHash("sha256").update(canonicalString).digest("hex");

          // Upsert logic
          const { data: existingJob } = await supabase
            .from("jobs")
            .select("id, title, description, location")
            .eq("canonical_hash", canonicalHash)
            .maybeSingle();

          const jobPayload = {
            title,
            description,
            location,
            company_name: companyName,
            source_url: sourceUrl,
            apply_url: applyUrl,
            posted_at: new Date(pubDate).toISOString(),
            is_aggregated: true,
            aggregated_source_id: source.id,
            canonical_hash: canonicalHash,
            status: "active",
            is_active: true,
            updated_at: new Date().toISOString(),
          };

          if (existingJob) {
            // Check if update needed (simple check)
            if (existingJob.title !== title || existingJob.description !== description) {
              const { error: updateError } = await supabase
                .from("jobs")
                .update(jobPayload)
                .eq("id", existingJob.id);
              if (!updateError) updated++;
            } else {
              skipped++;
            }
          } else {
            const { error: insertError } = await supabase
              .from("jobs")
              .insert({
                ...jobPayload,
                created_at: new Date().toISOString(),
              });
            if (!insertError) inserted++;
          }
        }
      }
    } catch (e: any) {
      console.error(`Ingestion error for source ${source.name}:`, e);
      runError = e.message;
    }

    // Record run
    await supabase.from("ingestion_runs").insert({
      id: runId,
      source_id: source.id,
      started_at: startTime,
      finished_at: new Date().toISOString(),
      inserted_count: inserted,
      updated_count: updated,
      skipped_count: skipped,
      error: runError,
    });

    overallResults.processed++;
    overallResults.inserted += inserted;
    overallResults.updated += updated;
    overallResults.skipped += skipped;
  }

  return NextResponse.json({
    ok: true,
    ...overallResults,
  });
}
