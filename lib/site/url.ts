const DEFAULT_SITE_URL = "http://localhost:3000";

export function getSafeSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw && raw.startsWith("http")) {
    return raw.replace(/\/$/, "");
  }
  return DEFAULT_SITE_URL;
}

export const SITE_URL = getSafeSiteUrl();
export const SITE_NAME = "Careers.mt";

/**
 * Generates an absolute URL for a given path.
 * @param path The path to append to the site URL (e.g., "/jobs")
 */
export function absUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
