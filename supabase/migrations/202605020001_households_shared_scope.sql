create extension if not exists "pgcrypto";

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint households_name_not_empty check (length(trim(name)) > 0)
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (household_id, user_id),
  constraint household_members_role_check check (role in ('owner', 'member'))
);

alter table public.notes
  add column if not exists scope text not null default 'personal';

alter table public.notes
  add column if not exists household_id uuid null references public.households(id) on delete set null;

alter table public.note_events
  add column if not exists scope text not null default 'personal';

alter table public.note_events
  add column if not exists household_id uuid null references public.households(id) on delete set null;

create index if not exists households_created_by_idx
  on public.households (created_by);

create index if not exists household_members_user_idx
  on public.household_members (user_id);

create index if not exists household_members_household_idx
  on public.household_members (household_id);

create index if not exists notes_owner_id_idx
  on public.notes (owner_id);

create index if not exists notes_scope_idx
  on public.notes (scope);

create index if not exists notes_household_id_idx
  on public.notes (household_id);

create index if not exists note_events_owner_id_idx
  on public.note_events (owner_id);

create index if not exists note_events_scope_idx
  on public.note_events (scope);

create index if not exists note_events_household_id_idx
  on public.note_events (household_id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'note_events'
      and column_name = 'command_type'
  ) then
    create index if not exists note_events_command_type_idx
      on public.note_events (command_type);
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'note_events'
      and column_name = 'command'
  ) then
    create index if not exists note_events_command_idx
      on public.note_events (command);
  end if;
end $$;

create or replace function public.set_households_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists households_set_updated_at on public.households;
create trigger households_set_updated_at
  before update on public.households
  for each row
  execute function public.set_households_updated_at();

create or replace function public.is_household_member(household_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = household_uuid
      and hm.user_id = user_uuid
  );
$$;

create or replace function public.is_household_owner(household_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = household_uuid
      and hm.user_id = user_uuid
      and hm.role = 'owner'
  );
$$;

create or replace function public.is_household_creator(household_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.households h
    where h.id = household_uuid
      and h.created_by = user_uuid
  );
$$;

alter table public.households enable row level security;
alter table public.household_members enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'households'
      and policyname = 'households_member_select'
  ) then
    create policy households_member_select
      on public.households
      for select
      using (created_by = auth.uid() or public.is_household_member(id, auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'households'
      and policyname = 'households_self_insert'
  ) then
    create policy households_self_insert
      on public.households
      for insert
      with check (created_by = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'households'
      and policyname = 'households_owner_update'
  ) then
    create policy households_owner_update
      on public.households
      for update
      using (public.is_household_owner(id, auth.uid()))
      with check (public.is_household_owner(id, auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'households'
      and policyname = 'households_owner_delete'
  ) then
    create policy households_owner_delete
      on public.households
      for delete
      using (public.is_household_owner(id, auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'household_members'
      and policyname = 'household_members_member_select'
  ) then
    create policy household_members_member_select
      on public.household_members
      for select
      using (public.is_household_member(household_id, auth.uid()) or user_id = auth.uid());
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'household_members'
      and policyname = 'household_members_owner_insert'
  ) then
    create policy household_members_owner_insert
      on public.household_members
      for insert
      with check (
        public.is_household_owner(household_id, auth.uid())
        or (
          user_id = auth.uid()
          and role = 'owner'
          and public.is_household_creator(household_id, auth.uid())
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'household_members'
      and policyname = 'household_members_owner_update'
  ) then
    create policy household_members_owner_update
      on public.household_members
      for update
      using (public.is_household_owner(household_id, auth.uid()))
      with check (public.is_household_owner(household_id, auth.uid()));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'household_members'
      and policyname = 'household_members_owner_delete'
  ) then
    create policy household_members_owner_delete
      on public.household_members
      for delete
      using (public.is_household_owner(household_id, auth.uid()));
  end if;
end $$;

alter table public.notes enable row level security;
alter table public.note_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_personal_owner_select'
  ) then
    create policy notes_personal_owner_select
      on public.notes
      for select
      using (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_personal_owner_insert'
  ) then
    create policy notes_personal_owner_insert
      on public.notes
      for insert
      with check (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_personal_owner_update'
  ) then
    create policy notes_personal_owner_update
      on public.notes
      for update
      using (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal')
      with check (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_personal_owner_delete'
  ) then
    create policy notes_personal_owner_delete
      on public.notes
      for delete
      using (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_household_member_select'
  ) then
    create policy notes_household_member_select
      on public.notes
      for select
      using (
        scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_household_member_insert'
  ) then
    create policy notes_household_member_insert
      on public.notes
      for insert
      with check (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_household_owner_update'
  ) then
    create policy notes_household_owner_update
      on public.notes
      for update
      using (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      )
      with check (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notes'
      and policyname = 'notes_household_owner_delete'
  ) then
    create policy notes_household_owner_delete
      on public.notes
      for delete
      using (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_personal_owner_select'
  ) then
    create policy note_events_personal_owner_select
      on public.note_events
      for select
      using (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_personal_owner_insert'
  ) then
    create policy note_events_personal_owner_insert
      on public.note_events
      for insert
      with check (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_personal_owner_update'
  ) then
    create policy note_events_personal_owner_update
      on public.note_events
      for update
      using (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal')
      with check (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_personal_owner_delete'
  ) then
    create policy note_events_personal_owner_delete
      on public.note_events
      for delete
      using (owner_id = auth.uid() and coalesce(scope, 'personal') = 'personal');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_household_member_select'
  ) then
    create policy note_events_household_member_select
      on public.note_events
      for select
      using (
        scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_household_member_insert'
  ) then
    create policy note_events_household_member_insert
      on public.note_events
      for insert
      with check (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_household_owner_update'
  ) then
    create policy note_events_household_owner_update
      on public.note_events
      for update
      using (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      )
      with check (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'note_events'
      and policyname = 'note_events_household_owner_delete'
  ) then
    create policy note_events_household_owner_delete
      on public.note_events
      for delete
      using (
        owner_id = auth.uid()
        and scope = 'household'
        and household_id is not null
        and public.is_household_member(household_id, auth.uid())
      );
  end if;
end $$;
