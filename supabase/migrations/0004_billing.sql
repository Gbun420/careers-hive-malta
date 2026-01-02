create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  type text check (type in ('featured')) not null,
  stripe_checkout_session_id text unique not null,
  stripe_payment_intent_id text,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.job_featured (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  featured_until timestamptz not null,
  featured_tier int default 1,
  updated_at timestamptz default now()
);

create index if not exists purchases_employer_id_idx
  on public.purchases (employer_id);
create index if not exists purchases_status_idx
  on public.purchases (status);
create index if not exists job_featured_until_idx
  on public.job_featured (featured_until);

alter table public.purchases enable row level security;
alter table public.job_featured enable row level security;

create policy "Employers can read own purchases"
  on public.purchases
  for select
  using (auth.uid() = employer_id);
