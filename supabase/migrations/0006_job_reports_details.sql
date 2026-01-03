do $$
begin
  if to_regclass('public.job_reports') is null then
    raise exception 'Missing job_reports table: run 0003_trust.sql first';
  end if;
end $$;

alter table public.job_reports
  add column if not exists details text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'job_reports'
      and column_name = 'reason_details'
  ) then
    execute 'update public.job_reports set details = reason_details where details is null';
  end if;
end $$;
