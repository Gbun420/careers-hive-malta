/**
 * Feature flags for Careers.mt
 * These are server-side only to ensure secure gating of public data.
 */
export const publicMetricsEnabled = process.env.PUBLIC_METRICS_ENABLED === "true";