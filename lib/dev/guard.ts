import { jsonError } from "@/lib/api/errors";

const DEV_HEADER = "x-dev-secret";

export function requireDevSecret(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, response: jsonError("FORBIDDEN", "Not available.", 403) };
  }

  const secret = process.env.DEV_TOOLS_SECRET;
  const provided = request.headers.get(DEV_HEADER);

  if (!secret || provided !== secret) {
    return { ok: false, response: jsonError("FORBIDDEN", "Invalid dev secret.", 403) };
  }

  return { ok: true };
}
