do $$
begin
  if to_regclass('public.job_reports') is null then
    raise exception 'Missing job_reports table: run 0003_trust.sql first';
  end if;
end $$;

create unique index if not exists job_reports_unique_open_idx
  on public.job_reports (job_id, reporter_id)
  where status in ('new', 'reviewing');
