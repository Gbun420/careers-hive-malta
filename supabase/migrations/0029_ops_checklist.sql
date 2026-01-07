-- Migration: 0029_ops_checklist.sql
-- Description: Table for tracking commercial readiness and operational health.

CREATE TABLE IF NOT EXISTS public.ops_checks (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  category text not null, -- P0, P1, P2
  title text not null,
  description text,
  status text not null default 'PENDING' check (status in ('PENDING', 'PASS', 'FAIL')),
  notes text,
  last_checked_at timestamptz,
  last_checked_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
ALTER TABLE public.ops_checks ENABLE ROW LEVEL SECURITY;

-- Admin-only full access
CREATE POLICY "admin manages ops checks"
ON public.ops_checks
FOR ALL
USING (exists (
  select 1 from public.profiles p
  where p.id = auth.uid()
    and lower(p.role) = 'admin'
));

-- Seed the checklist items
INSERT INTO public.ops_checks (key, category, title, description) VALUES
('p0_stripe_revenue', 'P0', 'Stripe Live Revenue Path', 'Money collected -> entitlement granted -> publish works -> downgrades enforced.'),
('p0_schema_alignment', 'P0', 'Supabase Migrations Aligned', 'Production DB matches repository migrations; no missing columns/tables.'),
('p0_rls_isolation', 'P0', 'RLS Enforcement (Tenant Isolation)', 'No cross-company reads/writes possible. Secure separation of data.'),
('p0_email_auth', 'P0', 'Domain Email Authentication', 'Resend SPF/DKIM/DMARC configured for careers.mt.'),
('p0_abuse_controls', 'P0', 'Rate Limits & Abuse Controls', 'Spam protection on messaging, alerts, and application endpoints.'),
('p0_cron_security', 'P0', 'Cron Endpoints Protected', 'Cron routes require x-cron-secret and are inaccessible publicly.'),
('p1_error_tracking', 'P1', 'Error Tracking (Sentry)', 'Real-time monitoring and alerting for production error spikes.'),
('p1_uptime_checks', 'P1', 'External Uptime Checks', 'Automated monitoring of pricing, sitemaps, webhooks, and crons.'),
('p1_logging_discipline', 'P1', 'Logging Discipline', 'No secrets or sensitive PII in logs; diagnostic info available.'),
('p1_core_page_stability', 'P1', 'Core Page Stability', 'Verification of critical pages for all roles (Anon, Seeker, Employer, Admin).'),
('p1_seo_sanity', 'P1', 'SEO Sanity', 'Canonical host set to careers.mt; sitemaps stable; noindex rules active.'),
('p1_legal_compliance', 'P1', 'Legal & Compliance Baseline', 'Terms, Privacy (GDPR), and Support contact info present.'),
('p2_admin_lockdown', 'P2', 'Admin Portal Locked', 'Access restricted via server-side allowlist and role checks.'),
('p2_admin_workflows', 'P2', 'Admin Workflows Operational', 'Metrics, verification, and reporting tools active for Day 1 management.'),
('p2_backup_recovery', 'P2', 'Backup & Recovery Plan', 'Database recovery procedure documented and verified.')
ON CONFLICT (key) DO NOTHING;
