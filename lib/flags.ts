/**
 * Feature flags for Careers.mt
 * These are server-side only to ensure secure gating of public data.
 */
export const publicMetricsEnabled = process.env.PUBLIC_METRICS_ENABLED === "true";
export const googleIndexingEnabled = process.env.GOOGLE_INDEXING_ENABLED === "true";
export const urlImporterEnabled = process.env.URL_IMPORTER_ENABLED === "true";
export const secondMeEnabled = process.env.SECOND_ME_ENABLED === "true";
