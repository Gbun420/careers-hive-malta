import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function GET() {
  const tables = ["profiles", "jobs", "saved_searches"] as const;
  const supabase = createServiceRoleClient();

  if (!supabase) {
    return NextResponse.json(
      {
        status: "unhealthy",
        tables: tables.map((name) => ({
          name,
          ok: false,
          error: "Missing server Supabase configuration.",
        })),
      },
      { status: 500 }
    );
  }

  const results = await Promise.all(
    tables.map(async (table) => {
      const { error } = await supabase.from(table).select("id").limit(1);
      return {
        name: table,
        ok: !error,
        error: error?.message,
      };
    })
  );

  const ok = results.every((result) => result.ok);

  return NextResponse.json(
    {
      status: ok ? "healthy" : "unhealthy",
      tables: results,
    },
    { status: ok ? 200 : 500 }
  );
}
