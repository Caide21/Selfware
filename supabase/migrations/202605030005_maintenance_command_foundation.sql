alter table public.maintenance_completions
  add column if not exists source_note_id uuid null references public.notes(id) on delete set null;

create index if not exists maintenance_completions_source_note_idx
  on public.maintenance_completions (source_note_id);

create unique index if not exists maintenance_loops_owner_active_title_unique_idx
  on public.maintenance_loops (owner_id, lower(regexp_replace(trim(title), '\s+', ' ', 'g')))
  where status = 'active';
