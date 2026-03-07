create policy "Authenticated users can create lobbies"
on public.lobbies
for insert
to authenticated
with check (auth.uid() = host_id);

create policy "Authenticated users can view lobbies"
on public.lobbies
for select
to authenticated
using (true);

create policy "Hosts can update their own lobbies"
on public.lobbies
for update
to authenticated
using (auth.uid() = host_id);
