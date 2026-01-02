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

## Alerts matching + dispatch (env missing)
- Not run.
- Manual: `curl -i -X POST http://localhost:3005/api/alerts/dispatch`.
- Expected: `403` or `503` depending on missing secret/Supabase.

## Alerts matching + dispatch (env present + SQL applied)
- Not run.
- Manual: create a job matching an instant saved search; check job POST response includes `notifications_enqueued > 0`.
- Manual: run `curl -i -X POST http://localhost:3005/api/alerts/dispatch -H \"x-alert-dispatch-secret: <secret>\"` and verify notifications are marked sent.
