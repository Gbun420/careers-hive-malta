import { NextResponse } from "next/server";

export type ErrorCode =
  | "SUPABASE_NOT_CONFIGURED"
  | "MEILI_NOT_CONFIGURED"
  | "STRIPE_NOT_CONFIGURED"
  | "EMAIL_NOT_CONFIGURED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "DB_ERROR";

export function jsonError(code: ErrorCode, message: string, status: number) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}
