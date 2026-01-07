# Careers.mt Operations Runbook

This document serves as the single source of truth for platform operations, maintaining the Vercel production control plane.

## 🛠️ Infrastructure: Vercel Production

- **Canonical URL**: `https://careers-hive-malta-prod.vercel.app` (Used for all sitemaps, canonical tags, and email links until `careers.mt` DNS is ready).
- **Control Plane**: Vercel Dashboard (Deployments, Logs, Env Vars).

## 🔑 Required Environment Variables

Ensure these are set in Vercel Production (`Settings > Environment Variables`):

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Set to `https://careers-hive-malta-prod.vercel.app` |
| `CRON_SECRET` | Shared secret for securing Vercel Cron endpoints |
| `SUPABASE_SERVICE_ROLE_KEY` | High-privilege key for system operations (NEVER expose to client) |
| `STRIPE_SECRET_KEY` | Live Stripe secret key |
| `RESEND_API_KEY` | Transactional email provider key |
| `NEXT_PUBLIC_POSTHOG_KEY` | Public key for client-side analytics |
| `POSTHOG_PERSONAL_API_KEY` | Backend key for server-side event tracking |

## ⏲️ Cron Job Management

Cron jobs are defined in `vercel.json` and secured by the `x-cron-secret` header.

- **Job Ingestion**: Runs every 30 minutes (`*/30 * * * *`).
- **Alerts Dispatch**: Runs daily at 07:00 UTC (`0 7 * * *`).

### Manual Execution (Verification)
To trigger a cron manually, use curl with the `x-cron-secret` header:
```bash
# Trigger job ingestion
curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET" https://careers-hive-malta-prod.vercel.app/api/cron/ingest-jobs

# Trigger alerts dispatch
curl -X POST -H "x-cron-secret: YOUR_CRON_SECRET" https://careers-hive-malta-prod.vercel.app/api/cron/send-alerts
```

### Rotating Secrets
1. Generate a new random string.
2. Update `CRON_SECRET` in Vercel.
3. Redeploy or restart the production environment.

## 📈 Monitoring & Health

### 1. Uptime Check
Monitor `https://careers-hive-malta-prod.vercel.app/api/health`.
Expected JSON response: `{ "ok": true, "ts": "...", "commit": "..." }`.

### 2. PostHog Events
Key operational events to track in the PostHog dashboard:
- `cron_ingest_done`: Ingestion success with item counts.
- `cron_alerts_done`: Email dispatch success with recipient counts.
- `cron_failed`: Triggered on any cron error.

### 3. Readiness Gate (/admin/ops)
The **Launch Control Panel** must show all **P0 (Critical Baseline)** items as **PASS** before driving paid traffic or enabling secondary domains.

## 🧪 Smoke Testing
Run the smoke test script locally against production:
```bash
BASE_URL="https://careers-hive-malta-prod.vercel.app" ./scripts/smoke-admin.sh
```
All checks must return **✅ GREEN**.
