# Careers.mt Vercel Operations Runbook

This guide covers the day-to-day operations and maintenance of Careers.mt on Vercel.

## 🔑 Environment Variables Checklist (Production)

Ensure these variables are configured in the Vercel Dashboard (`Settings > Environment Variables`):

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Prod | `https://careers-hive-malta-prod.vercel.app` (Canonical host) |
| `CRON_ENABLED` | Prod | Set to `"true"` to enable active job ingestion and alerts dispatch. |
| `CRON_SECRET` | Prod | Shared secret for securing cron endpoints. |
| `INTERNAL_STATS_TOKEN` | Prod | Token required for fetching public-facing landing stats. |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod | High-privilege Supabase key (Server-side only). |
| `STRIPE_SECRET_KEY` | Prod | Live Stripe API key. |
| `RESEND_API_KEY` | Prod | API key for transactional email delivery. |
| `POSTHOG_PERSONAL_API_KEY` | Prod | Backend key for server-side analytics. |

## ⏲️ Cron Job Management

Cron jobs are scheduled in `vercel.json` and executed via HTTP endpoints.

### 🛡️ Kill Switch (`CRON_ENABLED`)
- **Disable All Crons**: Set `CRON_ENABLED="false"` in Vercel. Routes will return `204 No Content`.
- **Enable All Crons**: Set `CRON_ENABLED="true"`.

### 🔄 Rotating `CRON_SECRET`
1. Generate a new high-entropy string.
2. Update the `CRON_SECRET` value in Vercel Dashboard.
3. Redeploy or restart the production environment to apply.

### 🛠️ Manual Execution
Trigger routes manually using the `x-cron-secret` header:
```bash
# Ingest Jobs
curl -X POST -H "x-cron-secret: YOUR_SECRET" https://careers-hive-malta-prod.vercel.app/api/cron/ingest-jobs

# Dispatch Alerts
curl -X POST -H "x-cron-secret: YOUR_SECRET" https://careers-hive-malta-prod.vercel.app/api/cron/send-alerts
```

## 📈 Monitoring & Health

### 1. Uptime Check
Monitor `https://careers-hive-malta-prod.vercel.app/api/health`.
Expected response: `{ "ok": true, "ts": "...", "commit": "..." }`.

### 2. Operational Events (PostHog)
Monitor these events in PostHog to verify system health:
- `cron_ingest_done`: Job ingestion succeeded.
- `cron_alerts_done`: Email dispatch succeeded.
- `cron_skipped`: Cron was called but `CRON_ENABLED` was false.
- `cron_failed`: An error occurred during cron execution.

## ⏪ Rollback & Recovery

### Redeploy Previous Build
1. Go to Vercel Dashboard > `Deployments`.
2. Select the last known stable deployment.
3. Click `...` > `Redeploy` (or `Promote to Production`).

### Database Migrations
Note: Supabase migrations are separate from Vercel deployments. If a rollback requires schema changes, they must be applied manually in the Supabase SQL Editor.
