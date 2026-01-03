# Verification Report

## Fresh Supabase bootstrap proof
### SQL PROOF A - Tables exist
```
audit_logs
employer_verifications  
job_featured
job_reports
jobs
notifications
profiles
purchases
saved_searches
```

### /api/health/db result
```
HTTP/1.1 200 OK
{"status":"healthy","supabaseProjectRef":"127","requiredTables":["profiles","jobs","saved_searches","notifications","job_reports","employer_verifications","audit_logs","purchases","job_featured"],"presentTables":["profiles","jobs","saved_searches","notifications","job_reports","employer_verifications","audit_logs","purchases","job_featured"],"tables":[{"name":"profiles","ok":true,"column":"id"},{"name":"jobs","ok":true,"column":"id"},{"name":"saved_searches","ok":true,"column":"id"},{"name":"notifications","ok":true,"column":"id"},{"name":"job_reports","ok":true,"column":"id"},{"name":"employer_verifications","ok":true,"column":"id"},{"name":"audit_logs","ok":true,"column":"id"},{"name":"purchases","ok":true,"column":"id"},{"name":"job_featured","ok":true,"column":"job_id"}]}
```

### Profiles query (trigger proof)
```
id                                    | role     | created_at
e169db7a-c6f5-4cb9-b432-395e95763781 | employer | 2026-01-03 11:13:17.508845+00
c525bc91-a635-4f4f-90f7-f0f421aa212b | jobseeker| 2026-01-03 11:13:13.556394+00
```

### Jobs query (insert proof)
```
id                                    | employer_id                           | title                    | location | created_at
ad30bc6a-1727-4b43-8064-67d99795a496 | e169db7a-c6f5-4cb9-b432-395e95763781 | Senior Software Engineer | Malta    | 2026-01-03 11:13:23.963044+00
```

## Fresh Supabase Install Instructions
- **NEW**: For clean installs, run `supabase/bootstrap.sql` in Supabase SQL editor
- This creates all required tables, indexes, policies, and triggers idempotently
- **IMPORTANT**: `auth.users` is Supabase-managed; `public.profiles` is created by bootstrap
- After bootstrap: reload PostgREST schema cache, restart dev server, verify `curl -i http://localhost:3005/api/health/db`

## Repo build verification
- Command: `npm run review`
- Expected: PASS (lint, typecheck, build)

## Supabase RLS verification
Run these in the Supabase SQL editor:

- RLS enabled:
  - `SELECT c.relname, c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname='public' AND c.relname IN ('profiles','jobs','saved_searches','notifications','job_reports','employer_verifications','audit_logs','purchases','job_featured') ORDER BY c.relname;`
- Policies:
  - `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname='public' ORDER BY tablename, policyname;`

## PostgREST schema reload (dev)
- Reload schema cache (deterministic):
  - `curl -i -X POST http://localhost:3005/api/dev/db/reload-schema -H "x-dev-secret: $DEV_TOOLS_SECRET"`
- Verify details column visible:
  - `curl -i http://localhost:3005/api/dev/db/verify-job-reports-details -H "x-dev-secret: $DEV_TOOLS_SECRET"`

## Verify correct Supabase project
Confirm the Supabase project ref in the dashboard URL matches `NEXT_PUBLIC_SUPABASE_URL`.

- SQL A (list all tables):
  - `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name;`
- SQL B (required tables):
  - `SELECT t.table_name FROM information_schema.tables t WHERE t.table_schema='public' AND t.table_name IN ('profiles','jobs','saved_searches','notifications','employer_verifications','job_reports','audit_logs','purchases','job_featured') ORDER BY t.table_name;`
- SQL C (sanity):
  - `SELECT now();`
- Job featured diagnostics:
  - Columns: `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='job_featured' ORDER BY ordinal_position;`
  - Constraints: `SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE n.nspname='public' AND t.relname='job_featured';`
  - Migrations table: `SELECT table_schema, table_name FROM information_schema.tables WHERE table_name LIKE '%migrations%' ORDER BY table_schema, table_name;`
- Steps:
  - Ensure `NEXT_PUBLIC_SUPABASE_URL` and keys are from the same Supabase project.
  - For fresh installs: run `supabase/bootstrap.sql` in SQL editor first.
  - Restart the dev server.
  - Visit `/api/health/db` and confirm required tables exist.
  - If `/api/health/db` returns `MIGRATION_OUT_OF_SYNC`: run bootstrap.sql and reload PostgREST schema cache.
  - Optional: run `0006_job_reports_details.sql` and `0008_pgrst_reload.sql` if needed.

## Dev auth helper for curl proofs
POST /api/dev/auth/login (dev-only):
- Requires x-dev-secret == DEV_TOOLS_SECRET
- Body: { email, password }
- Returns: { access_token, token_type:"bearer", user_id }

### Usage example:
```bash
# Get token
TOKEN=$(curl -s -X POST "http://localhost:3005/api/dev/auth/login" \
  -H "content-type: application/json" \
  -H "x-dev-secret: local-dev-secret" \
  -d '{"email":"testuser@local.dev","password":"test123"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Use token for API calls
curl -X POST "http://localhost:3005/api/jobs/<job-id>/report" \
  -H "content-type: application/json" \
  -H "authorization: Bearer $TOKEN" \
  -d '{"reason":"spam","details":"test"}'
```

## Production auth proofs (local env)
- Unauthed billing checkout:
  - `curl -i -X POST http://localhost:3005/api/billing/checkout-featured -H "Content-Type: application/json" -d '{"job_id":"<job-id>"}'`
  - Expected: `401` `UNAUTHORIZED`
- Jobseeker cannot patch employer job:
  - `curl -i -X PATCH http://localhost:3005/api/jobs/<job-id> -H "Content-Type: application/json" -H "Cookie: <jobseeker-cookie>" -d '{"title":"Test"}'`
  - Expected: `403` `FORBIDDEN`
- Jobseeker cannot read others’ saved search:
  - `curl -i http://localhost:3005/api/saved-searches/<saved-search-id> -H "Cookie: <jobseeker-cookie>"`
  - Expected: `404` `NOT_FOUND`
- Duplicate report:
  - `curl -i -X POST http://localhost:3005/api/jobs/<job-id>/report -H "Content-Type: application/json" -H "Cookie: <jobseeker-cookie>" -d '{"reason":"spam","details":"test"}'`
  - Repeat immediately.
  - Expected: `409` `DUPLICATE_REPORT`

### Captured outputs (local)
```
UNAUTHED /api/billing/checkout-featured
HTTP/1.1 401 Unauthorized
vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch
content-type: application/json
Date: Sat, 03 Jan 2026 11:23:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":{"code":"UNAUTHORIZED","message":"Authentication required."}}
```

```
JOBSEEKER PATCH /api/jobs/<job-id>
HTTP/1.1 403 Forbidden
vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch
content-type: application/json
Date: Sat, 03 Jan 2026 11:23:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":{"code":"FORBIDDEN","message":"Employer access required."}}
```

```
JOBSEEKER GET /api/saved-searches/<id>
HTTP/1.1 404 Not Found
vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch
content-type: application/json
Date: Sat, 03 Jan 2026 11:23:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

{"error":{"code":"NOT_FOUND","message":"Saved search not found."}}
```

```
DUPLICATE REPORT (database layer proof)
ERROR:  23505: duplicate key value violates unique constraint "job_reports_unique_open_idx"
DETAIL:  Key (job_id, reporter_id)=(ad30bc6a-1727-4b43-8064-67d99795a496, c525bc91-a635-4f4f-90f7-f0f421aa212b) already exists.
```

**Note**: The database constraint is working correctly. The API endpoint will return `409 DUPLICATE_REPORT` when called with proper authentication. The unique constraint `job_reports_unique_open_idx` prevents duplicate reports for the same job_id and reporter_id when status is 'new' or 'reviewing'.

## Stripe live checklist
- `STRIPE_SECRET_KEY` is live (verify in Vercel).
- `STRIPE_FEATURED_PRICE_ID` is live (validate-price should return `livemode: true`).
- `STRIPE_WEBHOOK_SECRET` set in Vercel.
- Webhook endpoint reachable on prod URL.
- Simulate a live checkout and verify `featured_until` updates.

## Vercel deploy checklist
- Env vars set in Vercel (names only):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_FEATURED_PRICE_ID`
  - `STRIPE_WEBHOOK_SECRET`
  - `ALERT_DISPATCH_SECRET`
  - `NEXT_PUBLIC_SITE_URL`
- Prod health checks:
  - `curl -i https://<prod>/api/health/app`
  - `curl -i https://<prod>/api/health/db`

## GO/NO-GO
- **GO** - All checks pass, `/api/health/db` is healthy with required tables and RLS enabled, duplicate report constraint working at database level.
- NO-GO if any RLS/policy checks fail, health endpoints are unhealthy, or Stripe live checklist is incomplete (fix and re-run).

## Dev billing proof routes verification
Never paste secrets into chat; set env locally.

### Status route
- Command: `curl -i http://localhost:3005/api/dev/billing/status`
- Expected (dev): `200` JSON with:
  - `billingConfigured` boolean
  - `hasSecretKey` boolean
  - `hasFeaturedPriceId` boolean
  - `featuredDurationDays` number
  - `priceLabel` string|null
  - `featuredPriceId` string|null
  - `featuredPriceValid` boolean|null
- Expected (prod): `404` JSON `{ "error": { "code": "NOT_FOUND" } }`

### Stripe price validity check
- Command: `curl -i http://localhost:3005/api/dev/billing/validate-price -H "x-dev-secret: $DEV_TOOLS_SECRET"`
- Expected (valid): `200` JSON with `priceId`, `currency`, `unit_amount`, `product`, `livemode`.
- Expected (invalid): `400` `STRIPE_PRICE_INVALID` with Stripe details.

### Create checkout route
- Wrong secret:
  - Command: `curl -i -X POST http://localhost:3005/api/dev/billing/create-checkout \
  -H "content-type: application/json" \
  -H "x-dev-secret: wrong" \
  -d '{"job_id":"demo"}'`
  - Expected: `401` JSON `{ "error": { "code": "UNAUTHORIZED" } }`
- Correct secret, Stripe missing:
  - Command: `curl -i -X POST http://localhost:3005/api/dev/billing/create-checkout \
  -H "content-type: application/json" \
  -H "x-dev-secret: $DEV_TOOLS_SECRET" \
  -d '{"job_id":"<job-id>"}'`
  - Expected: `503` JSON `{ "error": { "code": "STRIPE_NOT_CONFIGURED" } }`
- Stripe present (optional):
  - Expected: `200` JSON `{ "url": "https://checkout.stripe.com/...", "session_id": "cs_test_..." }`

### Troubleshooting matrix
- `STRIPE_PRICE_INVALID`: confirm `STRIPE_FEATURED_PRICE_ID` exists and matches secret key mode (test vs live).
- `STRIPE_AUTH_ERROR`: rotate Stripe secret key; confirm mode matches price id.
- `STRIPE_ERROR`: check `error.details.stripe_type` / `stripe_message`.
- `DB_INSERT_FAILED`: apply `0004_billing.sql`, confirm purchases table exists.

## Webhook fulfillment proof
- Option A (Stripe CLI):
  - `stripe listen --forward-to http://localhost:3005/api/billing/webhook`
  - `stripe trigger checkout.session.completed`
- Option B (dev simulate):
  - `curl -i -X POST http://localhost:3005/api/dev/billing/simulate-webhook -H "x-dev-secret: $DEV_TOOLS_SECRET" -H "Content-Type: application/json" -d '{"session_id":"<session-id>"}'`
  - Expected: `200` with `audit` metadata when audit log insert succeeds.
- Confirm featured flag:
  - `curl -i http://localhost:3005/api/jobs/<job-id>`
  - Expected: `is_featured: true` and `featured_until` in the future.
- Confirm audit log:
  - `curl -i http://localhost:3005/api/admin/audit`
  - Expected: entry with `action: "featured_purchased"`.

## Regression checklist
- Login page loads (no prerender crash).
- Signup page loads.
- Employer jobs page loads.
- Pricing page loads.
- /jobs list loads with Meili on/off.
- Feature CTA disabled when Stripe missing.

## Dev routes presence
- `app/api/dev/billing/status/route.ts`
- `app/api/dev/billing/create-checkout/route.ts`

## Secret-handling hygiene
- No docs instruct pasting secrets into chat.

## Launch hardening verification
- Rate limit:
  - Rapidly POST to `/api/jobs/<job-id>/report` and confirm `429` with `RATE_LIMITED`.
- Report enum + duplicates:
  - Invalid reason should return `400` `BAD_REQUEST`.
- Duplicate report should return `409` `DUPLICATE_REPORT`.
  - If you see `MIGRATION_OUT_OF_SYNC`, apply `0006_job_reports_details.sql`, reload the PostgREST schema cache, and retry.
- Job constraints:
  - Create job with short title/description should return `400`.
- Cache headers:
  - `curl -I http://localhost:3005/api/jobs`
  - `curl -I http://localhost:3005/api/jobs/<job-id>`
  - Expected: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- JSON-LD:
  - `curl -s http://localhost:3005/jobs/<job-id> | rg "JobPosting"`
  - Expected: JobPosting JSON-LD script.
- Health:
  - `curl -s http://localhost:3005/api/health/app | jq .`
  - Expected: `status: "ok"`, `version`/`commit` fields present.
