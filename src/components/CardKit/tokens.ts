import type { CardSize, CardTone, CardVariant } from './types';

export const cardToneSurfaces: Record<CardTone, string> = {
  neutral: 'bg-prism-surface text-prism-ink',
  info: 'bg-prism-info-surface text-prism-info-ink',
  success: 'bg-prism-success-surface text-prism-success-ink',
  warning: 'bg-prism-warning-surface text-prism-warning-ink',
  danger: 'bg-prism-danger-surface text-prism-danger-ink',
  brand: 'bg-prism-info-surface text-prism-info-ink',
  busy: 'bg-prism-busy-surface text-prism-busy-ink',
};

export const cardPaddingBySize: Record<CardSize, string> = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

export const cardVariantChrome: Record<CardVariant, string> = {
  solid: '',
  soft: '',
  outline: 'bg-transparent border border-white/20 dark:border-white/10',
  ghost: 'bg-transparent border-transparent shadow-none',
};

// Tailwind/Prism aliases only. DO NOT change underlying theme values.
export const cardTokens = {
  radius: 'rounded-2xl',
  chrome: {
    base: 'transition-all duration-200 ease-[cubic-bezier(.2,.8,.2,1)]',
    focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-prism-focus/60',
    selected: 'ring-2 ring-prism-focus/70',
    hairline: 'ring-1 ring-black/5 dark:ring-white/10',
  },
  header: 'flex items-start justify-between gap-3',
  title: 'font-semibold leading-tight truncate',
  subtitle: 'text-sm opacity-80',
  meta: 'text-[11px] uppercase tracking-wide opacity-70',
  body: 'mt-3 text-[0.95rem] leading-snug',
  footer: 'mt-4 flex items-center gap-2',
  actionRow: 'mt-4 flex items-center justify-end gap-2',
  paddingBySize: cardPaddingBySize,
  toneSurfaces: cardToneSurfaces,
  variantChrome: cardVariantChrome,
};

// Subtle Prism gradient stops per tone (keep saturation low to match Status Panel vibe)
export const prismByTone: Record<CardTone, [string, string]> = {
  neutral: ['#9aa0a6', '#c4c7c5'],
  info: ['#6ea8ff', '#a7c5ff'],
  success: ['#4ac08a', '#9be7c1'],
  warning: ['#f6b36b', '#ffd79a'],
  danger: ['#ff7a7a', '#ffb1b1'],
  brand: ['#6ea8ff', '#a7c5ff'],
  busy: ['#b48cff', '#d9c4ff'],
};

export function accentFromTone(tone: CardTone = 'neutral'): [string, string] {
  return prismByTone[tone] ?? prismByTone.neutral;
}
