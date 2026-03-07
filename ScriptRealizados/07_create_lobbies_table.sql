create table if not exists public.lobbies (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('public', 'private')),
  room_code text unique,
  status text not null default 'waiting' check (status in ('waiting', 'in_game', 'finished')),
  created_at timestamptz default now()
);
