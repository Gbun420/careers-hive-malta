-- Migration: 0017_monetization_setup.sql
-- Description: Adds billing and entitlement columns to profiles and jobs, and updates purchases.

-- 1. Update profiles with Stripe and Plan info
alter table public.profiles 
  add column if not exists stripe_customer_id text,
  add column if not exists plan text not null default 'FREE',
  add column if not exists plan_status text not null default 'inactive',
  add column if not exists current_period_end timestamptz;

create index if not exists profiles_stripe_customer_id_idx on public.profiles (stripe_customer_id);

-- 2. Update jobs with featured info
alter table public.jobs
  add column if not exists is_featured boolean default false,
  add column if not exists featured_until timestamptz;

-- 3. Update purchases table types and status
-- First, drop the check constraint if it exists to allow new types
do $$ begin
  alter table public.purchases drop constraint if exists purchases_type_check;
  alter table public.purchases drop constraint if exists purchases_status_check;
exception when others then null; end $$;

alter table public.purchases 
  alter column type type text,
  add constraint purchases_type_check check (type in ('JOB_POST', 'FEATURED_ADDON', 'PRO_SUB', 'featured')),
  alter column status set default 'pending',
  add constraint purchases_status_check check (status in ('pending', 'paid', 'failed', 'refunded'));

-- Add updated_at if not present
alter table public.purchases add column if not exists updated_at timestamptz default now();

-- 4. RLS Updates
-- Ensure employers can only see their own purchases (already exists, but reinforcing)
drop policy if exists "Employers can read own purchases" on public.purchases;
create policy "Employers can read own purchases"
  on public.purchases
  for select
  using (auth.uid() = employer_id);

-- Add policy for employers to see their own jobs (if not already handled by existing policies)
do $$ begin
  if not exists (
    select 1 from pg_policies where tablename = 'jobs' and policyname = 'Employers can manage own jobs'
  ) then
    create policy "Employers can manage own jobs"
      on public.jobs
      for all
      using (auth.uid() = employer_id);
  end if;
end $$;
