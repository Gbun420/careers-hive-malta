import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { isMeiliConfigured, reindexJobs } from "@/lib/search/meili";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";


const REINDEX_HEADER = "x-search-reindex-secret";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.SEARCH_REINDEX_SECRET;
  const provided = request.headers.get(REINDEX_HEADER);

  if (!secret || provided !== secret) {
    return jsonError("FORBIDDEN", "Invalid reindex secret.", 403);
  }

  if (!isMeiliConfigured()) {
    return jsonError(
      "MEILI_NOT_CONFIGURED",
      "Meilisearch is not configured.",
      503
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, employer_id, title, description, location, salary_range, created_at, is_active, status"
    );

  if (error) {
    return jsonError("DB_ERROR", error.message, 500);
  }

  try {
    const withFeatured = await attachFeaturedStatus(data ?? []);
    const enriched = await attachEmployerVerified(withFeatured);
    await reindexJobs(enriched);
  } catch (indexError) {
    return jsonError("DB_ERROR", "Failed to rebuild search index.", 500);
  }

  return NextResponse.json({ indexed: data?.length ?? 0 });
}
