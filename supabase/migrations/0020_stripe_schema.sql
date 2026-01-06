-- Migration: 0020_stripe_schema.sql
-- Description: Standardizes Stripe tables for careers.mt

-- A) stripe_customers
create table if not exists public.stripe_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz default now()
);

-- B) stripe_subscriptions
create table if not exists public.stripe_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  price_id text not null,
  status text not null, -- active | canceled | past_due | incomplete
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- C) stripe_purchases (ONE-TIME)
create table if not exists public.stripe_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_session_id text not null unique,
  price_id text not null,
  consumed boolean default false,
  metadata jsonb,
  created_at timestamptz default now(),
  consumed_at timestamptz
);

-- D) employer_entitlements
create table if not exists public.employer_entitlements (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  can_post_jobs boolean default false,
  remaining_job_posts int default 0,
  featured_until timestamptz null,
  plan text default 'FREE', -- FREE | PRO
  updated_at timestamptz default now()
);

-- E) stripe_events (IDEMPOTENCY)
create table if not exists public.stripe_events (
  id text primary key, -- stripe event id
  type text not null,
  processed_at timestamptz default now()
);

-- RLS
alter table public.stripe_customers enable row level security;
alter table public.stripe_subscriptions enable row level security;
alter table public.stripe_purchases enable row level security;
alter table public.employer_entitlements enable row level security;
alter table public.stripe_events enable row level security;

-- Policies
create policy "Users read own customers" on public.stripe_customers for select using (user_id = auth.uid());
create policy "Server full access customers" on public.stripe_customers for all using (auth.role() = 'service_role');

create policy "Users read own subs" on public.stripe_subscriptions for select using (user_id = auth.uid());
create policy "Server full access subs" on public.stripe_subscriptions for all using (auth.role() = 'service_role');

create policy "Users read own purchases" on public.stripe_purchases for select using (user_id = auth.uid());
create policy "Server full access purchases" on public.stripe_purchases for all using (auth.role() = 'service_role');

create policy "Users read own entitlements" on public.employer_entitlements for select using (user_id = auth.uid());
create policy "Server full access entitlements" on public.employer_entitlements for all using (auth.role() = 'service_role');

create policy "Server full access events" on public.stripe_events for all using (auth.role() = 'service_role');

-- Indexes
create index if not exists stripe_customers_user_id_idx on public.stripe_customers(user_id);
create index if not exists stripe_subscriptions_user_id_idx on public.stripe_subscriptions(user_id, status);
create index if not exists stripe_purchases_user_id_idx on public.stripe_purchases(user_id, consumed);
