import { resolveTags } from '../ui/tagRegistry';

const TONE_PRIORITY = ['constraint', 'danger', 'warning', 'status', 'ritual', 'skill', 'info', 'success', 'neutral'];

const KIND_TONE_MAP = {
  ritual: 'ritual',
  rituals: 'ritual',
  workflow: 'status',
  workflows: 'status',
  loadout: 'status',
  review: 'skill',
  reflection: 'skill',
  reflections: 'skill',
  note: 'info',
  generic: 'info',
  important: 'status',
  focus: 'info',
  busy: 'warning',
  alert: 'danger',
};

const VARIANT_BY_TONE = {
  ritual: 'info',
  status: 'info',
  success: 'success',
  skill: 'success',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
  constraint: 'busy',
  neutral: 'neutral',
};

function pickTone(card, tags) {
  if (card?.state?.tone) return card.state.tone;
  for (const tone of TONE_PRIORITY) {
    const match = tags.find((tag) => (tag.tone || '').toLowerCase() === tone);
    if (match) return tone;
  }
  if (card?.kind) {
    const normalized = String(card.kind).toLowerCase();
    if (KIND_TONE_MAP[normalized]) return KIND_TONE_MAP[normalized];
  }
  return 'neutral';
}

export function useCardStyle({ card = null, tags = [], selected = false, play = false } = {}) {
  const resolvedTags = resolveTags(tags);
  const tone = pickTone(card, resolvedTags);
  const grade = selected ? 'loud' : play ? 'balanced' : 'subtle';

  return {
    tone,
    grade,
    tags: resolvedTags,
    variant: VARIANT_BY_TONE[tone] ?? 'neutral',
  };
}
