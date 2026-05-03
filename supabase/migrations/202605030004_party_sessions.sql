create extension if not exists "pgcrypto";

create table if not exists public.party_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz null,
  start_note_id uuid null references public.notes(id) on delete set null,
  end_note_id uuid null references public.notes(id) on delete set null,
  participants jsonb not null default '[]'::jsonb,
  label text not null default 'partytime',
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint party_sessions_time_check check (ended_at is null or ended_at >= started_at),
  constraint party_sessions_label_not_empty check (length(trim(label)) > 0),
  constraint party_sessions_participants_array_check check (jsonb_typeof(participants) = 'array')
);

create unique index if not exists party_sessions_one_active_per_owner_idx
  on public.party_sessions (owner_id)
  where ended_at is null;

create index if not exists party_sessions_owner_started_idx
  on public.party_sessions (owner_id, started_at desc);

create index if not exists party_sessions_owner_ended_idx
  on public.party_sessions (owner_id, ended_at desc);

create or replace function public.set_party_sessions_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists party_sessions_set_updated_at on public.party_sessions;
create trigger party_sessions_set_updated_at
  before update on public.party_sessions
  for each row
  execute function public.set_party_sessions_updated_at();

alter table public.party_sessions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'party_sessions'
      and policyname = 'party_sessions_self_select'
  ) then
    create policy party_sessions_self_select
      on public.party_sessions
      for select
      using (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'party_sessions'
      and policyname = 'party_sessions_self_insert'
  ) then
    create policy party_sessions_self_insert
      on public.party_sessions
      for insert
      with check (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'party_sessions'
      and policyname = 'party_sessions_self_update'
  ) then
    create policy party_sessions_self_update
      on public.party_sessions
      for update
      using (auth.uid() = owner_id)
      with check (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'party_sessions'
      and policyname = 'party_sessions_self_delete'
  ) then
    create policy party_sessions_self_delete
      on public.party_sessions
      for delete
      using (auth.uid() = owner_id);
  end if;
end $$;
