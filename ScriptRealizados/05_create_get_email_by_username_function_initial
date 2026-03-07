create or replace function public.get_email_by_username(input_username text)
returns table(email text)
language sql
security definer
as $$
  select p.email
  from public.profiles p
  where p.username = lower(trim(input_username))
  limit 1;
$$;

grant execute on function public.get_email_by_username(text) to anon, authenticated;
