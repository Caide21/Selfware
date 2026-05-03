alter table public.maintenance_loops
  add column if not exists cadence text not null default 'manual';

alter table public.maintenance_loops
  add column if not exists due_time time null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'maintenance_loops_cadence_check'
      and conrelid = 'public.maintenance_loops'::regclass
  ) then
    alter table public.maintenance_loops
      add constraint maintenance_loops_cadence_check
      check (cadence in ('manual', 'daily'));
  end if;
end $$;

create index if not exists maintenance_loops_owner_cadence_status_due_idx
  on public.maintenance_loops (owner_id, cadence, status, due_time);

create table if not exists public.maintenance_completions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  loop_id uuid not null references public.maintenance_loops(id) on delete cascade,
  completed_on date not null default current_date,
  completed_at timestamptz not null default now(),
  source text not null default 'api',
  created_at timestamptz not null default now(),
  constraint maintenance_completions_source_not_empty check (length(trim(source)) > 0),
  constraint maintenance_completions_owner_loop_day_unique unique (owner_id, loop_id, completed_on)
);

create index if not exists maintenance_completions_owner_day_idx
  on public.maintenance_completions (owner_id, completed_on desc);

create index if not exists maintenance_completions_loop_day_idx
  on public.maintenance_completions (loop_id, completed_on desc);

alter table public.maintenance_completions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance_completions'
      and policyname = 'maintenance_completions_self_select'
  ) then
    create policy maintenance_completions_self_select
      on public.maintenance_completions
      for select
      using (auth.uid() = owner_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance_completions'
      and policyname = 'maintenance_completions_self_insert'
  ) then
    create policy maintenance_completions_self_insert
      on public.maintenance_completions
      for insert
      with check (
        auth.uid() = owner_id
        and exists (
          select 1
          from public.maintenance_loops ml
          where ml.id = loop_id
            and ml.owner_id = auth.uid()
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'maintenance_completions'
      and policyname = 'maintenance_completions_self_update'
  ) then
    create policy maintenance_completions_self_update
      on public.maintenance_completions
      for update
      using (auth.uid() = owner_id)
      with check (
        auth.uid() = owner_id
        and exists (
          select 1
          from public.maintenance_loops ml
          where ml.id = loop_id
            and ml.owner_id = auth.uid()
        )
      );
  end if;
end $$;
