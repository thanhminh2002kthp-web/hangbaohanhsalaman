-- Chạy một lần trong Supabase SQL Editor. Không chứa khóa Google.
create table if not exists public.google_sync_lock (
  id integer primary key check (id = 1),
  token uuid,
  expires_at timestamptz not null default '-infinity'
);
alter table public.google_sync_lock enable row level security;
revoke all on public.google_sync_lock from anon, authenticated;
insert into public.google_sync_lock (id) values (1) on conflict do nothing;

create or replace function public.acquire_google_sync_lock(token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare acquired boolean;
begin
  update public.google_sync_lock l set token = $1, expires_at = now() + interval '10 minutes'
  where l.id = 1 and l.expires_at < now();
  acquired := found;
  return acquired;
end $$;

create or replace function public.release_google_sync_lock(token uuid)
returns void language sql security definer set search_path = public as $$
  update public.google_sync_lock l set token = null, expires_at = '-infinity' where l.id = 1 and l.token = $1
$$;
revoke all on function public.acquire_google_sync_lock(uuid), public.release_google_sync_lock(uuid) from public, anon, authenticated;
grant execute on function public.acquire_google_sync_lock(uuid), public.release_google_sync_lock(uuid) to service_role;
