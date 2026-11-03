begin;

create table if not exists public.library_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  show_id integer not null check (show_id > 0),
  show jsonb not null,
  favorite boolean not null default false,
  watched boolean not null default false,
  rating smallint,
  revision text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, show_id),
  constraint rating_requires_watched check (
    (watched and rating is not null and rating between 1 and 5)
    or (not watched and rating is null)
  ),
  constraint show_is_object check (jsonb_typeof(show) = 'object'),
  constraint show_matches_id check (show ? 'id' and (show ->> 'id')::integer = show_id)
);

alter table public.library_entries enable row level security;
revoke all on public.library_entries from anon, authenticated;
grant select, insert, update, delete on public.library_entries to authenticated;

create policy "read_own_library" on public.library_entries
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert_own_library" on public.library_entries
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update_own_library" on public.library_entries
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete_own_library" on public.library_entries
  for delete to authenticated using ((select auth.uid()) = user_id);

create or replace function public.touch_library_entry()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger library_entry_updated before update on public.library_entries
  for each row execute function public.touch_library_entry();

commit;
