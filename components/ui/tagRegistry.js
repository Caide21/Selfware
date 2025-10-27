const DEFAULT_TAGS = {
  'loadout:today': {
    label: 'Today',
    tone: 'status',
    grade: 'balanced',
    intent: 'active',
    description: 'Current equipped loadout',
  },
  'mind:flow-trigger': {
    label: 'Flow Trigger',
    tone: 'skill',
    grade: 'balanced',
    intent: 'active',
  },
  'mind:ritual': {
    label: 'Ritual',
    tone: 'ritual',
    grade: 'subtle',
    intent: 'quiet',
  },
  'mind:archive': {
    label: 'Archive',
    tone: 'constraint',
    grade: 'subtle',
    intent: 'quiet',
  },
  'mind:equipped': {
    label: 'Equipped',
    tone: 'status',
    grade: 'balanced',
    intent: 'active',
  },
  'mind:practicing': {
    label: 'Practicing',
    tone: 'skill',
    grade: 'balanced',
    intent: 'active',
  },
  'mind:ready': {
    label: 'Ready',
    tone: 'info',
    grade: 'balanced',
    intent: 'quiet',
  },
  'mind:draft': {
    label: 'Draft',
    tone: 'neutral',
    grade: 'subtle',
    intent: 'quiet',
  },
};

export const TAGS = DEFAULT_TAGS;

export function tagFromSlug(slug, overrides = {}) {
  if (!slug) return { ...overrides };
  const base = TAGS[slug] || {};
  const fallbackLabel =
    overrides.label ||
    base.label ||
    slug
      .split(':')
      .pop()
      .replace(/[-_]/g, ' ');

  return {
    slug,
    ...base,
    ...overrides,
    label: fallbackLabel
      ? fallbackLabel.replace(/\b\w/g, (char) => char.toUpperCase())
      : undefined,
  };
}

export function resolveTags(list = []) {
  if (!Array.isArray(list)) return [];
  return list
    .map((entry) => {
      if (!entry) return null;
      if (typeof entry === 'string') return tagFromSlug(entry);
      if (entry.slug) return tagFromSlug(entry.slug, entry);
      return { ...entry };
    })
    .filter(Boolean);
}
