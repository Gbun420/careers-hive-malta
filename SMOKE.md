# Smoke Checks

## Env missing path (no Supabase keys)
- Not run.
- Manual: `npm run dev`, visit `/setup`, then attempt `/jobseeker/dashboard`.
- Expected: `/setup` renders with missing key list; protected routes redirect to `/setup` without crashing.

## Env present path (Supabase keys set)
- Not run (waiting on Supabase SQL to be applied).
- Manual: `npm run dev`, then `curl http://localhost:3000/api/health/db`.
- Expected: `{\"status\":\"healthy\",\"tables\":[{\"name\":\"profiles\",\"ok\":true},{\"name\":\"jobs\",\"ok\":true},{\"name\":\"saved_searches\",\"ok\":true}]}`.

## Verify correct Supabase project
- Manual: confirm the Supabase project ref in the dashboard URL matches `NEXT_PUBLIC_SUPABASE_URL`.
- SQL A (list all tables):
  - `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name;`
- SQL B (required tables):
  - `SELECT t.table_name FROM information_schema.tables t WHERE t.table_schema='public' AND t.table_name IN ('profiles','jobs','saved_searches','job_reports','employer_verifications','audit_logs','job_featured','purchases') ORDER BY t.table_name;`
- SQL C (sanity):
  - `SELECT now();`
- Job featured diagnostics:
  - Columns: `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='job_featured' ORDER BY ordinal_position;`
  - Constraints: `SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid JOIN pg_namespace n ON t.relnamespace = n.oid WHERE n.nspname='public' AND t.relname='job_featured';`
  - Migrations table: `SELECT table_schema, table_name FROM information_schema.tables WHERE table_name LIKE '%migrations%' ORDER BY table_schema, table_name;`
- Expected: required tables present in SQL B; `/api/health/db` returns healthy.
- If `/api/health/db` returns `MIGRATION_OUT_OF_SYNC`: apply the missing migrations (including `0004_billing.sql` and `0007_billing_fix.sql`) and reload the PostgREST schema cache.

## Admin signup gating
- Not run.
- Manual: ensure `ALLOW_ADMIN_SIGNUP` is unset -> admin option not shown on `/signup`.
- Manual: set `ALLOW_ADMIN_SIGNUP=true` and `ADMIN_ALLOWLIST=you@example.com` -> admin appears, only allowlisted email can sign up.

## Saved searches (env missing)
- Not run.
- Manual: leave Supabase env unset, visit `/jobseeker/alerts`.
- Expected: gating message with link to `/setup`, no crash.

## Saved searches (env present + SQL applied)
- Not run.
- Manual: create, edit, and delete a saved search under `/jobseeker/alerts`.
- Manual: sign in as a second user and verify they cannot access another user's saved search via direct URL.

## Jobs (env missing)
- Not run.
- Manual: leave Supabase env unset, visit `/employer/jobs` and `/jobs`.
- Expected: gating message with link to `/setup`, no crash.

## Jobs (env present + SQL applied)
- Not run.
- Manual: create, edit, delete a job under `/employer/jobs` and confirm it appears in `/jobs` when active.

## Jobs search (Meilisearch missing)
- Not run.
- Manual: leave `MEILI_HOST`/`MEILI_API_KEY` unset, visit `/jobs`.
- Expected: jobs list loads via DB fallback; no crash.

## Jobs search (Meilisearch configured)
- Not run.
- Manual: start Meilisearch (`docker compose up -d`), set `MEILI_HOST`, `MEILI_API_KEY`, `MEILI_INDEX_JOBS=jobs`.
- Manual: run `curl -i -X POST http://localhost:3005/api/search/reindex -H "x-search-reindex-secret: <secret>"`.
- Manual: visit `/jobs`, run a keyword search and location filter.
- Expected: results update; page shows “Search powered by fast index.”

## Employer verification (env missing)
- Not run.
- Manual: leave Supabase env unset, visit `/employer/verification`.
- Expected: gating message with link to `/setup`, no crash.

## Employer verification (env present + SQL applied)
- Not run.
- Manual: sign in as employer, submit request at `/employer/verification`.
- Manual: admin approves via `/admin/verifications`.
- Expected: employer sees Approved status; job listings show Verified badge.

## Job reports (env present + SQL applied)
- Not run.
- Manual: sign in as jobseeker and submit report from `/jobs/[id]`.
- Manual: admin resolves report via `/admin/reports`.
- Expected: report status updates; audit log entry created.

## Audit logs (env present)
- Not run.
- Manual: `curl -i http://localhost:3005/api/admin/audit`.
- Expected: JSON array of recent admin actions.

## Alerts matching + dispatch (env missing)
- Not run.
- Manual: `curl -i -X POST http://localhost:3005/api/alerts/dispatch`.
- Expected: `403` or `503` depending on missing secret/Supabase.

## Alerts matching + dispatch (env present + SQL applied)
- Not run.
- Manual: create a job matching an instant saved search; check job POST response includes `notifications_enqueued > 0`.
- Manual: run `curl -i -X POST http://localhost:3005/api/alerts/dispatch -H \"x-alert-dispatch-secret: <secret>\"` and verify notifications are marked sent.

## Stripe featured billing (env missing)
- Not run.
- Manual: unset Stripe env vars, reload `/employer/jobs`.
- Expected: Feature button disabled with billing not configured messaging.
- Manual: `curl -i -X POST http://localhost:3005/api/billing/checkout-featured -H \"Content-Type: application/json\" -d '{\"job_id\":\"<job-id>\"}'`.
- Expected: `503` with `STRIPE_NOT_CONFIGURED`.

## Stripe featured billing (env present + SQL applied)
- Not run.
- Manual: set Stripe env vars and apply `0004_billing.sql`.
- Manual: click “Feature” in `/employer/jobs` and confirm checkout session URL returned.
- Manual: send Stripe webhook for `checkout.session.completed`, then verify job shows Featured badge and `featured_until` updated.

## Landing responsiveness
- Not run.
- Manual: open `/` at 375px, 768px, 1024px, 1440px widths.
- Expected: hero headline wraps cleanly, navbar works with hamburger on mobile, and CTAs remain visible without awkward breaks.

## Pricing + upsell surfaces
- Not run.
- Manual: visit `/pricing` on desktop + mobile.
- Expected: pricing cards render; featured CTA disabled when Stripe env missing; CTA links to employer signup when enabled.
- Manual: create a job and confirm `/employer/jobs?created=1&jobId=<id>` shows Boost CTA.
- Manual: visit `/employer/jobs/<id>/edit` and confirm Feature panel shows benefits + CTA or featured until date.

## Pricing + upsell proof (Stripe missing)
- Not run.
- Manual: unset `STRIPE_SECRET_KEY` and `STRIPE_FEATURED_PRICE_ID`, restart dev server.
- Manual: visit `/pricing` -> Featured CTA disabled with “Billing not configured” helper text.
- Manual: visit `/employer/jobs` -> Feature buttons disabled with tooltip; no network call to `/api/billing/checkout-featured` on click.
- Manual: `curl -i -X POST http://localhost:3005/api/billing/checkout-featured -H "Content-Type: application/json" -d '{"job_id":"<job-id>"}'`
- Expected: `503` with `error.code == "STRIPE_NOT_CONFIGURED"`.

## Pricing + upsell proof (Stripe present)
- Not run.
- Manual: set Stripe env vars + apply `0004_billing.sql`, then login as employer.
- Manual: click Feature CTA on `/employer/jobs` or `/employer/jobs/<id>/edit`.
- Expected: redirected to Stripe Checkout URL.
- Manual: open DevTools Network, confirm `/api/billing/checkout-featured` returns `200` with `{ "url": "https://checkout.stripe.com/..." }`.

## Stripe Proof (Dev routes)
- Not run.
- Price validity check:
  - `curl -i http://localhost:3005/api/dev/billing/validate-price -H "x-dev-secret: $DEV_TOOLS_SECRET"`
  - Expected: `200` with price metadata, or `400` `STRIPE_PRICE_INVALID`.
- Stripe-missing path:
  - `curl -i http://localhost:3005/api/dev/billing/status`
  - Expected: `200` JSON with `billingConfigured: false`.
  - `curl -i -X POST http://localhost:3005/api/dev/billing/create-checkout -H "x-dev-secret: $DEV_TOOLS_SECRET" -H "Content-Type: application/json" -d '{"job_id":"<job-id>"}'`
  - Expected: `503` with `error.code == "STRIPE_NOT_CONFIGURED"` (requires correct dev secret).
- Stripe-present path:
  - Manual: set Stripe env vars locally (do not share secrets).
  - `curl -i http://localhost:3005/api/dev/billing/status`
  - Expected: `billingConfigured: true`, `hasSecretKey: true`, `hasFeaturedPriceId: true`.
  - `curl -i -X POST http://localhost:3005/api/dev/billing/create-checkout -H "x-dev-secret: $DEV_TOOLS_SECRET" -H "Content-Type: application/json" -d '{"job_id":"<job-id>"}'`
  - Expected: `200` JSON with `{ "url": "https://checkout.stripe.com/...", "session_id": "cs_test_..." }`.
 - Troubleshooting matrix:
   - `STRIPE_PRICE_INVALID`: verify `STRIPE_FEATURED_PRICE_ID` exists and matches key mode (test vs live).
   - `STRIPE_AUTH_ERROR`: rotate Stripe secret key; confirm mode matches price id.
   - `STRIPE_ERROR`: inspect `error.details.stripe_type` and `stripe_message`.
   - `DB_INSERT_FAILED`: apply `0004_billing.sql`, verify purchases table exists.

## Stripe webhook fulfillment proof
- Not run.
- Option A (Stripe CLI):
  - `stripe listen --forward-to http://localhost:3005/api/billing/webhook`
  - `stripe trigger checkout.session.completed`
  - Expected: webhook returns `200` and job featured status updates.
- Option B (dev simulate):
  - `curl -i -X POST http://localhost:3005/api/dev/billing/simulate-webhook -H "x-dev-secret: $DEV_TOOLS_SECRET" -H "Content-Type: application/json" -d '{"session_id":"<session-id>"}'`
  - Expected: `200` with `{ ok: true, fulfilled: true, job_id, featured_until, audit }`.
- Verify featured status:
  - `curl -i http://localhost:3005/api/jobs/<job-id>`
  - Expected: `is_featured: true` and `featured_until` in the future.
- Audit log:
  - `curl -i http://localhost:3005/api/admin/audit`
  - Expected: entry with `action: "featured_purchased"`.

## Launch hardening checks
- Rate limit (reports):
  - Run 6 rapid report submissions; expect `429` with `RATE_LIMITED`.
  - Example: `for i in {1..6}; do curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3005/api/jobs/<job-id>/report -H "Content-Type: application/json" -d '{"reason":"spam"}'; done`
- Report reason enum:
  - `curl -i -X POST http://localhost:3005/api/jobs/<job-id>/report -H "Content-Type: application/json" -d '{"reason":"invalid"}'`
  - Expected: `400` with `BAD_REQUEST`.
- Duplicate report:
  - Submit twice for the same job as the same user.
  - Expected: `409` with `DUPLICATE_REPORT`.
  - If you see `DB_ERROR` about missing `details` column: apply `0006_job_reports_details.sql` and reload the PostgREST schema cache in Supabase.
- Job constraints:
  - Attempt to create a job with short title/description; expect `400`.
- Cache headers:
  - `curl -I http://localhost:3005/api/jobs`
  - `curl -I http://localhost:3005/api/jobs/<job-id>`
  - Expected: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- JSON-LD presence:
  - `curl -s http://localhost:3005/jobs/<job-id> | rg "JobPosting"`
  - Expected: JobPosting JSON-LD script present.
- Health endpoint:
  - `curl -s http://localhost:3005/api/health/app | jq .`
  - Expected: `{"status":"ok","version":...,"commit":...}`.
