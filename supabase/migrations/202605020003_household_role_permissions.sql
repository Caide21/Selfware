-- Expand household roles and tighten shared command permissions.

alter table public.household_members enable row level security;
alter table public.note_events enable row level security;

update public.household_members
set role = 'contributor'
where role = 'member';

alter table public.household_members
  drop constraint if exists household_members_role_check;

alter table public.household_members
  add constraint household_members_role_check
  check (role in ('owner', 'editor', 'contributor', 'viewer'));

create or replace function public.can_create_household_note_event(household_uuid uuid, user_uuid uuid, event_command text)
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
      and (
        case lower(coalesce(event_command, ''))
          when 'sharedexpense' then hm.role in ('owner', 'editor')
          when 'contribute' then hm.role in ('owner', 'editor', 'contributor')
          else hm.role in ('owner', 'editor', 'contributor', 'viewer')
        end
      )
  );
$$;

drop policy if exists household_members_owner_insert on public.household_members;
create policy household_members_owner_insert
  on public.household_members
  for insert
  with check (
    public.is_household_owner(household_id, auth.uid())
    or (
      user_id = auth.uid()
      and role = 'owner'
      and exists (
        select 1
        from public.households h
        where h.id = household_members.household_id
          and h.created_by = auth.uid()
      )
    )
  );

drop policy if exists household_members_owner_update on public.household_members;
create policy household_members_owner_update
  on public.household_members
  for update
  using (public.is_household_owner(household_id, auth.uid()))
  with check (public.is_household_owner(household_id, auth.uid()));

drop policy if exists household_members_owner_delete on public.household_members;
create policy household_members_owner_delete
  on public.household_members
  for delete
  using (public.is_household_owner(household_id, auth.uid()));

drop policy if exists note_events_household_member_insert on public.note_events;
create policy note_events_household_member_insert
  on public.note_events
  for insert
  with check (
    owner_id = auth.uid()
    and scope = 'household'
    and household_id is not null
    and public.can_create_household_note_event(household_id, auth.uid(), command)
  );
