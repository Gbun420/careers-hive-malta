do $$
begin
  if to_regclass('public.profiles') is null then
    raise exception 'Missing base schema: run 0001_init.sql first';
  end if;
  if to_regclass('public.jobs') is null then
    raise exception 'Missing base schema: run 0001_init.sql first';
  end if;
  if to_regclass('public.saved_searches') is null then
    raise exception 'Missing base schema: run 0001_init.sql first';
  end if;
end $$;

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  saved_search_id uuid not null references public.saved_searches(id) on delete cascade,
  channel text not null check (channel in ('email')),
  status text not null default 'pending' check (status in ('pending','sent','failed')),
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notifications_status_idx on public.notifications (status);
create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
drop policy if exists notifications_insert_service on public.notifications;
drop policy if exists notifications_update_service on public.notifications;

create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

create policy notifications_insert_service on public.notifications
  for insert with check (auth.role() = 'service_role');

create policy notifications_update_service on public.notifications
  for update using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
