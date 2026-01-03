do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Missing base schema: run 0001_init.sql first';
  end if;
  if to_regclass('public.jobs') is null then
    raise exception 'Missing base schema: run 0001_init.sql first';
  end if;
end $$;

create table if not exists public.employer_verifications (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  notes text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references public.profiles(id)
);

create table if not exists public.job_reports (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references public.jobs(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete cascade,
  status text check (status in ('new', 'reviewing', 'resolved', 'dismissed')) default 'new',
  reason text not null,
  resolution_notes text,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewer_id uuid references public.profiles(id)
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists employer_verifications_employer_id_idx
  on public.employer_verifications (employer_id);
create index if not exists employer_verifications_status_idx
  on public.employer_verifications (status);
create index if not exists job_reports_job_id_idx
  on public.job_reports (job_id);
create index if not exists job_reports_reporter_id_idx
  on public.job_reports (reporter_id);
create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at);

alter table public.employer_verifications enable row level security;
alter table public.job_reports enable row level security;
alter table public.audit_logs enable row level security;

create policy "Employers can insert own verification"
  on public.employer_verifications
  for insert
  with check (auth.uid() = employer_id);

create policy "Employers can view own verification"
  on public.employer_verifications
  for select
  using (auth.uid() = employer_id);

create policy "Admins can read verifications"
  on public.employer_verifications
  for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can update verifications"
  on public.employer_verifications
  for update
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Users can insert job reports"
  on public.job_reports
  for insert
  with check (auth.uid() = reporter_id);

create policy "Users can view own reports"
  on public.job_reports
  for select
  using (auth.uid() = reporter_id);

create policy "Admins can read reports"
  on public.job_reports
  for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can update reports"
  on public.job_reports
  for update
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can read audit logs"
  on public.audit_logs
  for select
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );

create policy "Admins can insert audit logs"
  on public.audit_logs
  for insert
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'admin'
    )
  );
