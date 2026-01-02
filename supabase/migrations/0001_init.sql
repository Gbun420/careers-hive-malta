create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text check (role in ('jobseeker', 'employer', 'admin')) default 'jobseeker',
  created_at timestamptz default now()
);

create table if not exists public.jobs (
  id uuid primary key default uuid_generate_v4(),
  employer_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  location text,
  salary_range text,
  created_at timestamptz default now(),
  is_active boolean default true
);

create table if not exists public.saved_searches (
  id uuid primary key default uuid_generate_v4(),
  jobseeker_id uuid references public.profiles(id) on delete cascade,
  search_criteria jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.saved_searches enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Anyone can view active jobs" on public.jobs
  for select using (is_active = true);

create policy "Employers can manage their jobs" on public.jobs
  for all using (auth.uid() = employer_id);

create policy "Jobseekers can manage own searches" on public.saved_searches
  for all using (auth.uid() = jobseeker_id);
