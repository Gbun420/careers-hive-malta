-- Migration: 0028_message_email_delivery.sql
-- Description: Tracks email delivery attempts for employer-to-candidate messages to ensure idempotency.

CREATE TABLE IF NOT EXISTS public.message_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.application_messages(id) on delete cascade,
  recipient_user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  resend_id text,
  status text not null default 'PENDING' check (status in ('PENDING','SENT','FAILED', 'SKIPPED')),
  error text,
  created_at timestamptz default now(),
  sent_at timestamptz
);

-- Unique index to prevent duplicate emails for the same message to the same recipient
CREATE UNIQUE INDEX IF NOT EXISTS message_email_deliveries_message_unique 
ON public.message_email_deliveries(message_id, recipient_email);

-- RLS
ALTER TABLE public.message_email_deliveries ENABLE ROW LEVEL SECURITY;

-- Admin-only read access
CREATE POLICY "admin reads email deliveries"
ON public.message_email_deliveries
FOR SELECT
USING (exists (
  select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
));

-- Service role full access
CREATE POLICY "service role full access email deliveries"
ON public.message_email_deliveries
FOR ALL
USING (auth.role() = 'service_role');
