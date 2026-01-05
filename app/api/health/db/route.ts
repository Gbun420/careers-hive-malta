import { NextResponse } from "next/server";
import { type SupabaseClient } from "@supabase/supabase-js";
import { createEdgeServiceClient } from "@/lib/supabase-edge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TableCheck = {
  name: string;
  column: string;
};

export async function GET() {
  const requiredTables: TableCheck[] = [
    { name: "profiles", column: "id" },
    { name: "jobs", column: "id" },
    { name: "saved_searches", column: "id" },
    { name: "notifications", column: "id" },
    { name: "job_reports", column: "details" },
    { name: "employer_verifications", column: "id" },
    { name: "audit_logs", column: "id" },
    { name: "purchases", column: "id" },
    { name: "job_featured", column: "job_id" },
  ];
  
  const supabase = createEdgeServiceClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  const supabaseProjectRef = getSupabaseProjectRef();
  const presentTables = await fetchPresentTables(supabase);
  const presentTableSet = new Set(presentTables ?? []);

  const results = await Promise.all(
    requiredTables.map(async (table) => {
      const { error } = await supabase
        .from(table.name)
        .select(table.column)
        .limit(1);
      return {
        name: table.name,
        ok: !error,
        column: table.column,
        error: error?.message,
      };
    })
  );

  const requiredTableNames = requiredTables.map((table) => table.name);
  const missingTables = presentTables
    ? requiredTableNames.filter((table) => !presentTableSet.has(table))
    : results.filter((result) => !result.ok).map((result) => result.name);
  const schemaErrors = results.reduce<Record<string, string>>((acc, result) => {
    if (result.error) {
      acc[result.name] = result.error;
    }
    return acc;
  }, {});
  if (presentTables) {
    for (const table of missingTables) {
      delete schemaErrors[table];
    }
  }
  const presentRequiredCount = presentTables
    ? requiredTableNames.filter((table) => presentTableSet.has(table)).length
    : requiredTableNames.length - missingTables.length;
  const ok = missingTables.length === 0 && Object.keys(schemaErrors).length === 0;
  const presentTablesSample =
    presentTables?.slice(0, 20) ??
    results.filter((result) => result.ok).map((result) => result.name);
  const migrationThreshold = Math.ceil(requiredTables.length * 0.6);
  const isMigrationOutOfSync =
    presentRequiredCount >= migrationThreshold ||
    (presentRequiredCount > 0 && Object.keys(schemaErrors).length > 0);

  if (!ok) {
    return NextResponse.json(
      {
        status: "unhealthy",
        error: {
          code: isMigrationOutOfSync
            ? "MIGRATION_OUT_OF_SYNC"
            : "WRONG_DATABASE",
          message: isMigrationOutOfSync
            ? "Connected database is missing required tables or columns."
            : "Connected database is missing required tables.",
          details: {
            supabaseProjectRef,
            missingTables,
            schemaErrors: Object.keys(schemaErrors).length > 0 ? schemaErrors : undefined,
            presentTablesSample,
          },
        },
        requiredTables: requiredTableNames,
        presentTables: presentTables ?? presentTablesSample,
        tables: results,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "healthy",
    supabaseProjectRef,
    requiredTables: requiredTableNames,
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
