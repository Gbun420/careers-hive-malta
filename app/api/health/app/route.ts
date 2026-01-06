import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: process.env.APP_VERSION ?? null,
    commit: process.env.GIT_COMMIT_SHA ?? null,
  });
}
