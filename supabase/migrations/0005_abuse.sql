alter table public.job_reports
  add column if not exists details text;

create unique index if not exists job_reports_unique_open_idx
  on public.job_reports (job_id, reporter_id)
  where status in ('new', 'reviewing');
