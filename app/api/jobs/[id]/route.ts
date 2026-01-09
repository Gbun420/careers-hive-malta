import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";
import { attachEmployerVerified } from "@/lib/trust/verification";
import { attachFeaturedStatus } from "@/lib/billing/featured";
import type { Job } from "@/lib/jobs/schema";
import { SITE_URL } from "@/lib/site/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createRouteHandlerClient();
  if (!supabase) return jsonError("SUPABASE_NOT_CONFIGURED", "Supabase is not configured.", 503);

  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      employer:profiles!jobs_employer_id_fkey (
        id,
        full_name

      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("Job detail error:", error);
    if (!data) console.error("Job details empty for ID:", id);
    return jsonError("NOT_FOUND", "Job not found.", 404);
  }

  const [withFeatured] = await attachFeaturedStatus([data as Job]);
  const [enriched] = await attachEmployerVerified([withFeatured || data as Job]);

  return NextResponse.json({ data: enriched });
}