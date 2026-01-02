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
