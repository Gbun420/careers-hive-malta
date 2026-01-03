create or replace function public.pgrst_reload_schema()
returns void
language plpgsql
security definer
as $$
begin
  perform pg_notify('pgrst', 'reload schema');
end;
$$;

revoke all on function public.pgrst_reload_schema() from public;
