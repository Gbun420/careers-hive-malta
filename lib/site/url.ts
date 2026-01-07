export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://careers-hive-malta-prod.vercel.app";

/**
 * Generates an absolute URL for a given path.
 * @param path The path to append to the site URL (e.g., "/jobs")
 */
export function absUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
