do $$
begin
  alter table public.job_reports
  add column if not exists details text;
end $$;
