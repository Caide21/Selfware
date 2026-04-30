create extension if not exists "pgcrypto";

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_note_id uuid references public.notes(id) on delete set null,
  type text not null check (type in ('income', 'expense', 'savings')),
  amount numeric not null check (amount > 0),
  category text,
  description text,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_transactions_owner_occurred_idx
  on public.finance_transactions (owner_id, occurred_on desc);

create index if not exists finance_transactions_source_note_idx
  on public.finance_transactions (source_note_id);

create or replace function public.set_finance_transactions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists finance_transactions_set_updated_at on public.finance_transactions;
create trigger finance_transactions_set_updated_at
  before update on public.finance_transactions
  for each row
  execute function public.set_finance_transactions_updated_at();

alter table public.finance_transactions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'finance_transactions'
      and policyname = 'finance_transactions_self_select'
  ) then
    create policy finance_transactions_self_select
      on public.finance_transactions
      for select
      using (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'finance_transactions'
      and policyname = 'finance_transactions_self_insert'
  ) then
    create policy finance_transactions_self_insert
      on public.finance_transactions
      for insert
      with check (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'finance_transactions'
      and policyname = 'finance_transactions_self_update'
  ) then
    create policy finance_transactions_self_update
      on public.finance_transactions
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
      and tablename = 'finance_transactions'
      and policyname = 'finance_transactions_self_delete'
  ) then
    create policy finance_transactions_self_delete
      on public.finance_transactions
      for delete
      using (auth.uid() = owner_id);
  end if;
end $$;
