const DEFAULT_SITE_URL = "https://careers-hive-malta-prod.vercel.app";

function normalizeSiteUrl(raw?: string) {
  const v = (raw ?? "").trim();
  if (!v) return DEFAULT_SITE_URL;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return DEFAULT_SITE_URL;
    // remove trailing slash
    return u.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/**
 * Generates an absolute URL for a given path.
 * @param path The path to append to the site URL (e.g., "/jobs")
 */
export function absUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
