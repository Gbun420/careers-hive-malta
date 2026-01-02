# Database Setup (Supabase)

Apply the schema and RLS policies from `supabase/migrations/0001_init.sql` in the Supabase SQL editor.

Tables
- `profiles`: extends `auth.users`
- `jobs`: employer postings
- `saved_searches`: jobseeker alerts

Notes
- `profiles.id` matches `auth.users.id`.
- RLS is enabled on all tables with per-user policies.
- Employers can only manage their own jobs.
- Jobseekers can only manage their own saved searches.
- `salary_range` is stored as text for now; switch to `salary_min`/`salary_max` when you need filtering or matching.

After applying the SQL, hit `/api/health/db` locally to confirm the connection.
