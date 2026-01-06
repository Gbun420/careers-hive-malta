-- Migration: 0019_second_me_rpc.sql
-- Description: Adds RPC function for atomic usage increment

create or replace function public.increment_second_me_usage(target_user_id uuid, target_day date)
returns int
language plpgsql
security definer
as $$
declare
  new_count int;
begin
  insert into public.second_me_usage_daily (user_id, day, count)
  values (target_user_id, target_day, 1)
  on conflict (user_id, day)
  do update set count = second_me_usage_daily.count + 1
  returning count into new_count;
  
  return new_count;
end;
$$;
