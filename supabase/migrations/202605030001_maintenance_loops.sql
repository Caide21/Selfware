create extension if not exists "pgcrypto";

create table if not exists public.maintenance_loops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint maintenance_loops_title_not_empty check (length(trim(title)) > 0),
  constraint maintenance_loops_status_check check (status in ('active', 'inactive', 'archived'))
);

create index if not exists maintenance_loops_owner_status_created_idx
  on public.maintenance_loops (owner_id, status, created_at desc);

create index if not exists maintenance_loops_owner_title_idx
  on public.maintenance_loops (owner_id, lower(title));

create or replace function public.set_maintenance_loops_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists maintenance_loops_set_updated_at on public.maintenance_loops;
create trigger maintenance_loops_set_updated_at
  before update on public.maintenance_loops
  for each row
  execute function public.set_maintenance_loops_updated_at();

alter table public.maintenance_loops enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance_loops'
      and policyname = 'maintenance_loops_self_select'
  ) then
    create policy maintenance_loops_self_select
      on public.maintenance_loops
      for select
      using (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance_loops'
      and policyname = 'maintenance_loops_self_insert'
  ) then
    create policy maintenance_loops_self_insert
      on public.maintenance_loops
      for insert
      with check (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance_loops'
      and policyname = 'maintenance_loops_self_update'
  ) then
    create policy maintenance_loops_self_update
      on public.maintenance_loops
      for update
      using (auth.uid() = owner_id)
      with check (auth.uid() = owner_id);
  end if;
end $$;
