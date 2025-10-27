create extension if not exists "pgcrypto";

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  kind text,
  state jsonb default '{}'::jsonb,
  layout jsonb default '{}'::jsonb,
  meta jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.cards(id) on delete cascade,
  type text not null,
  payload jsonb default '{}'::jsonb,
  "order" int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mutations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  card_id uuid references public.cards(id) on delete cascade,
  op text not null,
  diff jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.cards enable row level security;
alter table public.attachments enable row level security;
alter table public.mutations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'cards' and policyname = 'cards_self_access'
  ) then
    create policy cards_self_access
      on public.cards
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'attachments' and policyname = 'attachments_self_access'
  ) then
    create policy attachments_self_access
      on public.attachments
      using (
        exists (
          select 1
          from public.cards c
          where c.id = card_id
            and c.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.cards c
          where c.id = card_id
            and c.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'mutations' and policyname = 'mutations_self_access'
  ) then
    create policy mutations_self_access
      on public.mutations
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
