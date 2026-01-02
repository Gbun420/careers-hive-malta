import { jsonError } from "@/lib/api/errors";

const DEV_HEADER = "x-dev-secret";

export function requireDevSecret(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, response: jsonError("NOT_FOUND", "Not found.", 404) };
  }

  const secret = process.env.DEV_TOOLS_SECRET;
  const provided = request.headers.get(DEV_HEADER);

  if (!secret || provided !== secret) {
    return { ok: false, response: jsonError("UNAUTHORIZED", "Unauthorized.", 401) };
  }

  return { ok: true };
}
