import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api/errors";

export async function GET() {
  const requiredTables = [
    "profiles",
    "jobs",
    "saved_searches",
    "job_reports",
    "employer_verifications",
    "audit_logs",
    "job_featured",
    "purchases",
  ] as const;
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return jsonError(
      "SUPABASE_NOT_CONFIGURED",
      "Supabase is not configured.",
      503
    );
  }

  const supabaseProjectRef = getSupabaseProjectRef();
  const presentTables = await fetchPresentTables(supabase);

  const results = await Promise.all(
    requiredTables.map(async (table) => {
      const { error } = await supabase.from(table).select("id").limit(1);
      return {
        name: table,
        ok: !error,
        error: error?.message,
      };
    })
  );

  const missingTables = results.filter((result) => !result.ok).map((result) => result.name);
  const ok = missingTables.length === 0;
  const presentTablesSample =
    presentTables?.slice(0, 20) ??
    results.filter((result) => result.ok).map((result) => result.name);

  if (!ok) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: {
          code: "WRONG_DATABASE",
          message: "Connected database is missing required tables.",
          details: {
            supabaseProjectRef,
            missingTables,
            presentTablesSample,
          },
        },
        requiredTables,
        presentTables: presentTables ?? presentTablesSample,
        tables: results,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "healthy",
    supabaseProjectRef,
    requiredTables,
    presentTables: presentTables ?? presentTablesSample,
    tables: results,
  });
}

function getSupabaseProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    return null;
  }
  try {
    const host = new URL(url).hostname;
    return host.split(".")[0] ?? null;
  } catch (error) {
    return null;
  }
}

async function fetchPresentTables(
  supabase: SupabaseClient
): Promise<string[] | null> {
  const attempts: Array<{
    schema: string;
    table: string;
    column: string;
    filterColumn: string;
  }> = [
    {
      schema: "information_schema",
      table: "tables",
      column: "table_name",
      filterColumn: "table_schema",
    },
    {
      schema: "pg_catalog",
      table: "pg_tables",
      column: "tablename",
      filterColumn: "schemaname",
    },
  ];

  for (const attempt of attempts) {
    try {
      const { data, error } = await supabase
        .schema(attempt.schema)
        .from(attempt.table)
        .select(attempt.column)
        .eq(attempt.filterColumn, "public");

      if (!error && data) {
        const rows = Array.isArray(data)
          ? (data as unknown as Array<Record<string, unknown>>)
          : [];
        return rows
          .map((row) => String(row[attempt.column]))
          .filter(Boolean);
      }
    } catch (error) {
      // Ignore and fall back.
    }
  }

  return null;
}
