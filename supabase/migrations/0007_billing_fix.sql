do $$
begin
  if to_regclass('public.jobs') is null then
    raise exception 'Missing base schema: run 0001_init.sql first';
  end if;
end $$;

create table if not exists public.job_featured (
  job_id uuid primary key references public.jobs(id) on delete cascade,
  featured_until timestamptz not null,
  featured_tier int default 1,
  updated_at timestamptz default now()
);

alter table public.job_featured
  add column if not exists job_id uuid;
alter table public.job_featured
  add column if not exists featured_until timestamptz;
alter table public.job_featured
  add column if not exists featured_tier int default 1;
alter table public.job_featured
  add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.job_featured'::regclass
      and contype = 'p'
  ) then
    alter table public.job_featured
      add constraint job_featured_pkey primary key (job_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.job_featured'::regclass
      and contype = 'f'
      and conname = 'job_featured_job_id_fkey'
  ) then
    alter table public.job_featured
      add constraint job_featured_job_id_fkey
      foreign key (job_id)
      references public.jobs(id)
      on delete cascade;
  end if;
end $$;

create index if not exists job_featured_until_idx
  on public.job_featured (featured_until);

alter table public.job_featured enable row level security;
