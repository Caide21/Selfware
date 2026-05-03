create extension if not exists "pgcrypto";

create table if not exists public.bossa_weekly_shifts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null,
  day_of_week int not null,
  status text not null default 'scheduled',
  start_time time null,
  end_time time null,
  source_note_id uuid null references public.notes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bossa_weekly_shifts_day_check check (day_of_week between 1 and 7),
  constraint bossa_weekly_shifts_status_check check (status in ('scheduled', 'off')),
  constraint bossa_weekly_shifts_time_check check (
    (status = 'off' and start_time is null and end_time is null)
    or (status = 'scheduled' and start_time is not null and end_time is not null and start_time < end_time)
  ),
  constraint bossa_weekly_shifts_owner_week_day_unique unique (owner_id, week_start_date, day_of_week)
);

create index if not exists bossa_weekly_shifts_owner_week_idx
  on public.bossa_weekly_shifts (owner_id, week_start_date, day_of_week);

create or replace function public.set_bossa_weekly_shifts_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bossa_weekly_shifts_set_updated_at on public.bossa_weekly_shifts;
create trigger bossa_weekly_shifts_set_updated_at
  before update on public.bossa_weekly_shifts
  for each row
  execute function public.set_bossa_weekly_shifts_updated_at();

alter table public.bossa_weekly_shifts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'bossa_weekly_shifts'
      and policyname = 'bossa_weekly_shifts_self_select'
  ) then
    create policy bossa_weekly_shifts_self_select
      on public.bossa_weekly_shifts
      for select
      using (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'bossa_weekly_shifts'
      and policyname = 'bossa_weekly_shifts_self_insert'
  ) then
    create policy bossa_weekly_shifts_self_insert
      on public.bossa_weekly_shifts
      for insert
      with check (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'bossa_weekly_shifts'
      and policyname = 'bossa_weekly_shifts_self_update'
  ) then
    create policy bossa_weekly_shifts_self_update
      on public.bossa_weekly_shifts
      for update
      using (auth.uid() = owner_id)
      with check (auth.uid() = owner_id);
  end if;
end $$;
