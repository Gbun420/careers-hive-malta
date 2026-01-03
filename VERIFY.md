# Verification Report

## Repo build verification
- Command: `npm run review`
- Expected: PASS (lint, typecheck, build)

## Verify correct Supabase project
Confirm the Supabase project ref in the dashboard URL matches `NEXT_PUBLIC_SUPABASE_URL`.

- SQL A (list all tables):
  - `SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') ORDER BY table_schema, table_name;`
- SQL B (required tables):
  - `SELECT t.table_name FROM information_schema.tables t WHERE t.table_schema='public' AND t.table_name IN ('profiles','jobs','saved_searches','job_reports','employer_verifications','audit_logs','job_featured','purchases') ORDER BY t.table_name;`
- SQL C (sanity):
  - `SELECT now();`
- Steps:
  - Ensure `NEXT_PUBLIC_SUPABASE_URL` and keys are from the same Supabase project.
  - Restart the dev server.
  - Visit `/api/health/db` and confirm required tables exist.
  - Apply migrations in order: `0001`, `0002`, `0003`, `0004`, `0005`, `0006` (if present).

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
  - If you see a schema cache error for `details`, apply `0006_job_reports_details.sql` and reload the PostgREST schema cache in Supabase.
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
