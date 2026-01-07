# Local Runtime Documentation

This document outlines the operational details for running `careers-hive-malta` in a local development environment.

## Required Environment Variables (.env.local)

The following variables are required for the application to function correctly locally:

```bash
# Supabase Configuration (Local Stack)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Meilisearch (Docker)
MEILI_HOST=http://127.0.0.1:7700
MEILI_API_KEY=local-meili-master-key

# Debugging
NEXT_PUBLIC_DEBUG_LINKS=1
```

## Local-Specific Behavior

1.  **Redirection Gating**: The middleware treats `localhost` and `127.0.0.1` as trusted. Canonical host redirects (e.g., to the production Vercel URL) are disabled.
2.  **Setup Page**: In local mode, the middleware does not force redirection to `/setup` if environment variables are missing, allowing for more flexible debugging.
3.  **Link Debugging**: When `NEXT_PUBLIC_DEBUG_LINKS=1` is set, a runtime trap is active in the browser console. It will log a stack trace if an empty link is clicked or if `window.open` is called with a falsy URL.

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Preview (Local)
1.  Ensure `output: 'standalone'` is commented out in `next.config.js`.
2.  Run:
    ```bash
    npm run build
    npm run start
    ```

## Differences vs Vercel

*   **Canonical Redirects**: Only active when `VERCEL_ENV === "production"`.
*   **Asset Serving**: Local `next start` serves assets from the filesystem; Vercel uses its edge network.
*   **Cron Jobs**: Local cron endpoints must be triggered manually or via scripts; Vercel uses `vercel.json` schedules.
