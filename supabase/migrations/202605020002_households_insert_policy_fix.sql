-- Align household RLS insert policies with client-safe create flow.

alter table public.households enable row level security;
alter table public.household_members enable row level security;

drop policy if exists households_self_insert on public.households;
create policy households_self_insert
  on public.households
  for insert
  with check (created_by = auth.uid());

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
