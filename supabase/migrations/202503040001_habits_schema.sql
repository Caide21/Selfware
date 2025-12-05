-- Ensure public.habits supports polarity-based grouping
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  description text,
  cadence text,
  streak integer default 0,
  xp_value integer default 0,
  status text,
  polarity text check (polarity in ('good', 'bad', 'neutral')) default 'good',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.habits add column if not exists user_id uuid;
alter table public.habits add column if not exists title text;
alter table public.habits add column if not exists description text;
alter table public.habits add column if not exists cadence text;
alter table public.habits add column if not exists streak integer default 0;
alter table public.habits add column if not exists xp_value integer default 0;
alter table public.habits add column if not exists status text;
alter table public.habits add column if not exists polarity text check (polarity in ('good', 'bad', 'neutral')) default 'good';
alter table public.habits add column if not exists created_at timestamptz default now();
alter table public.habits add column if not exists updated_at timestamptz default now();

alter table public.habits enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'habits'
      and policyname = 'habits_self_access'
  ) then
    create policy habits_self_access
      on public.habits
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;