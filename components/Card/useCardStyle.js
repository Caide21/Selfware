import { resolveTags } from '../ui/tagRegistry';
import tokens from '@/components/Themes/PrismPaper/tokens';

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

function hexToRgba(hex = '#ffffff', alpha = 1) {
  const normalized = hex.replace('#', '');
  const hexValue = normalized.length === 3 ? normalized.split('').map((ch) => ch + ch).join('') : normalized;
  const int = parseInt(hexValue, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const { colors, gradients } = tokens;

const CARD_THEME = {
  ritual: {
    accent: colors.violet,
    soft: hexToRgba(colors.violet, 0.2),
    gradient: `linear-gradient(135deg, ${colors.violet}, ${colors.mint})`,
  },
  status: {
    accent: colors.mint,
    soft: hexToRgba(colors.mint, 0.22),
    gradient: `linear-gradient(135deg, ${colors.mint}, ${colors.violet})`,
  },
  success: {
    accent: colors.mint,
    soft: hexToRgba(colors.mint, 0.22),
    gradient: `linear-gradient(135deg, ${colors.mint}, ${colors.coral})`,
  },
  skill: {
    accent: colors.coral,
    soft: hexToRgba(colors.coral, 0.22),
    gradient: `linear-gradient(135deg, ${colors.coral}, ${colors.violet})`,
  },
  info: {
    accent: colors.info,
    soft: hexToRgba(colors.info, 0.2),
    gradient: `linear-gradient(135deg, ${colors.info}, ${colors.mint})`,
  },
  warning: {
    accent: '#F97316',
    soft: 'rgba(249, 115, 22, 0.24)',
    gradient: 'linear-gradient(135deg, #FBBF24, #FB7185)',
  },
  danger: {
    accent: '#EF4444',
    soft: 'rgba(239, 68, 68, 0.25)',
    gradient: 'linear-gradient(135deg, #F87171, #FB7185)',
  },
  constraint: {
    accent: '#475569',
    soft: 'rgba(71, 85, 105, 0.25)',
    gradient: 'linear-gradient(135deg, #475569, #94A3B8)',
  },
  neutral: {
    accent: '#94A3B8',
    soft: 'rgba(148, 163, 184, 0.22)',
    gradient: 'linear-gradient(135deg, #CBD5F5, #E2E8F0)',
  },
};

function themeForTone(tone) {
  return CARD_THEME[tone] || CARD_THEME.neutral;
}

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

const RING_BY_TONE = {
  ritual: 'ring-primary/40',
  skill: 'ring-tertiary/40',
  status: 'ring-secondary/40',
  constraint: 'ring-slate-300/70',
  success: 'ring-secondary/40',
  info: 'ring-info/40',
  warning: 'ring-amber-400/40',
  danger: 'ring-tertiary/50',
  neutral: 'ring-slate-300/60',
};

export function useCardStyle({ card = null, tags = [], selected = false, play = false, variant = 'plain' } = {}) {
  const resolvedTags = resolveTags(tags);
  const tone = pickTone(card, resolvedTags);
  const grade = selected ? 'loud' : play ? 'balanced' : 'subtle';
  const ringTone = RING_BY_TONE[tone] || RING_BY_TONE.neutral;
  const toneTheme = themeForTone(tone);

  const ringClass =
    variant === 'plain'
      ? selected
        ? `ring-2 ring-offset-2 ring-offset-white ${ringTone}`
        : play
        ? `ring ring-offset-1 ring-offset-white ${ringTone}`
        : ''
      : '';

  const baseClass =
    variant === 'prism'
      ? ['pp-card', 'transition-all duration-300 ease-out']
      : ['rounded-2xl border border-slate-200 bg-white transition-all duration-200 ease-out shadow-sm'];

  if (variant === 'plain' && play && !selected) {
    baseClass.push('shadow-md');
  }

  const cardClass = [...baseClass, ringClass].filter(Boolean).join(' ');

  const titleClass = 'font-semibold text-text';
  const accentStyle =
    variant === 'prism'
      ? {
          '--card-accent': toneTheme.accent,
          '--card-soft': toneTheme.soft,
          '--card-gradient': toneTheme.gradient || gradients.rainbow,
        }
      : {};

  return {
    tone,
    grade,
    tags: resolvedTags,
    cardClass,
    titleClass,
    accentStyle,
    accentColor: toneTheme.accent,
  };
}
