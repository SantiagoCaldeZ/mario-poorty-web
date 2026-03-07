create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, email)
  values (
    new.id,
    lower(trim(new.raw_user_meta_data->>'username')),
    lower(trim(new.email))
  );
  return new;
end;
$$;
