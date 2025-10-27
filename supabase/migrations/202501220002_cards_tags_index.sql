create index if not exists idx_cards_state_tags
  on public.cards
  using gin ((state->'tags'));
