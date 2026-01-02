# Smoke Checks

## Env missing path (no Supabase keys)
- Not run.
- Manual: `npm run dev`, visit `/setup`, then attempt `/jobseeker/dashboard`.
- Expected: `/setup` renders with missing key list; protected routes redirect to `/setup` without crashing.

## Env present path (Supabase keys set)
- Not run (waiting on Supabase SQL to be applied).
- Manual: `npm run dev`, then `curl http://localhost:3000/api/health/db`.
- Expected: `{\"status\":\"healthy\",\"tables\":[{\"name\":\"profiles\",\"ok\":true},{\"name\":\"jobs\",\"ok\":true},{\"name\":\"saved_searches\",\"ok\":true}]}`.

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

## Stripe Featured Proof
### A) Stripe env-missing
- Run:
  - `curl -i -X POST http://localhost:3005/api/billing/checkout-featured -H "Content-Type: application/json" -d '{"job_id":"<job-id>"}'`
- Expected: `503` with `error.code == "STRIPE_NOT_CONFIGURED"`.

### B) Stripe env-present
- Manual: set `STRIPE_SECRET_KEY`, `STRIPE_FEATURED_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`, `FEATURED_DURATION_DAYS`, apply `0004_billing.sql`.
- Manual (UI): `/employer/jobs` → Feature → expect JSON `{ "url": "https://checkout.stripe.com/..." }`.
- Webhook:
  - `stripe listen --forward-to http://localhost:3005/api/billing/webhook`
  - `stripe trigger checkout.session.completed`
- Verify featured order + source marker:
  - `curl -s "http://localhost:3005/api/jobs?q=<keyword>&location=<city>" | jq .`
  - Expected: `source` is `"db"` or `"meili"` and the first job has `is_featured: true` (or `featured_until` in the future).

### C) Meili boost proof (optional)
- Manual: ensure Meili is configured and reindex.
  - `curl -i -X POST http://localhost:3005/api/search/reindex -H "x-search-reindex-secret: <secret>"`
  - `curl -s "http://localhost:3005/api/jobs?q=<keyword>" | jq .`
- Expected: `source: "meili"` and featured job appears first.

## Landing responsiveness
- Not run.
- Manual: open `/` at 375px, 768px, 1024px, 1440px widths.
- Expected: hero headline wraps cleanly, navbar works with hamburger on mobile, and CTAs remain visible without awkward breaks.
