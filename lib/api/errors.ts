import { NextResponse } from "next/server";

export type ErrorCode =
  | "SUPABASE_NOT_CONFIGURED"
  | "MEILI_NOT_CONFIGURED"
  | "STRIPE_NOT_CONFIGURED"
  | "STRIPE_ERROR"
  | "STRIPE_PRICE_INVALID"
  | "STRIPE_AUTH_ERROR"
  | "EMAIL_NOT_CONFIGURED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INVALID_INPUT"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "JOB_NOT_FOUND"
  | "DB_ERROR"
  | "DB_INSERT_FAILED"
  | "DB_UPDATE_FAILED";

export function jsonError(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}
