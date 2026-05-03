-- Keep note deletion and command-derived data in one RLS-preserving path.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'note_events'
      and column_name = 'note_id'
  ) then
    delete from public.note_events ne
    where ne.note_id is not null
      and not exists (
        select 1
        from public.notes n
        where n.id = ne.note_id
      );

    create index if not exists note_events_note_id_idx
      on public.note_events (note_id);

    alter table public.note_events
      drop constraint if exists note_events_note_id_fkey;

    alter table public.note_events
      add constraint note_events_note_id_fkey
      foreign key (note_id)
      references public.notes(id)
      on delete cascade;
  end if;
end $$;

do $$
declare
  constraint_name text;
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'finance_transactions'
      and column_name = 'source_note_id'
  ) then
    select tc.constraint_name
      into constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on kcu.constraint_schema = tc.constraint_schema
      and kcu.constraint_name = tc.constraint_name
      and kcu.table_schema = tc.table_schema
      and kcu.table_name = tc.table_name
    where tc.constraint_schema = 'public'
      and tc.table_schema = 'public'
      and tc.table_name = 'finance_transactions'
      and tc.constraint_type = 'FOREIGN KEY'
      and kcu.column_name = 'source_note_id'
    limit 1;

    if constraint_name is not null then
      execute format('alter table public.finance_transactions drop constraint %I', constraint_name);
    end if;

    alter table public.finance_transactions
      add constraint finance_transactions_source_note_id_fkey
      foreign key (source_note_id)
      references public.notes(id)
      on delete cascade;
  end if;
end $$;

create or replace function public.delete_note_with_derived_data(target_note_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.finance_transactions
  where source_note_id = target_note_id;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'note_events'
      and column_name = 'note_id'
  ) then
    delete from public.note_events
    where note_id = target_note_id;
  end if;

  delete from public.notes
  where id = target_note_id;

  get diagnostics deleted_count = row_count;

  if deleted_count = 0 then
    raise exception 'Note was not deleted. It may already be gone, or you may not have permission to delete it.'
      using errcode = '42501';
  end if;
end;
$$;
