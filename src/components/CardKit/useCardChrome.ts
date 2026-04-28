import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { accentFromTone, cardTokens, prismByTone } from './tokens';
import type { CardChromeOptions, CardTone, CardVariant } from './types';

const MASK_LAYER = 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)';

const VARIANT_VALUES: CardVariant[] = ['solid', 'soft', 'outline', 'ghost'];

function isCardVariant(value: CardChromeOptions['variant']): value is CardVariant {
  return typeof value === 'string' && (VARIANT_VALUES as string[]).includes(value);
}

function normalizeTone(tone?: CardChromeOptions['tone'], variant?: CardChromeOptions['variant']): CardTone {
  if (tone && typeof tone === 'string') return tone as CardTone;
  if (variant && typeof variant === 'string' && prismByTone[variant as CardTone]) {
    return variant as CardTone;
  }
  return 'neutral';
}

function resolveAccentStops(accent: CardChromeOptions['accent'], tone: CardTone) {
  if (accent === false || accent === 'none') {
    return null;
  }

  if (accent == null || accent === 'auto') {
    return accentFromTone(tone);
  }

  if (Array.isArray(accent)) {
    const stops = accent.filter(Boolean);
    return stops.length >= 2 ? stops : accentFromTone(tone);
  }

  if (typeof accent === 'string') {
    const trimmed = accent.trim();
    if (!trimmed || trimmed === 'auto') {
      return accentFromTone(tone);
    }
    if (trimmed === 'none') {
      return null;
    }
    if (trimmed.includes(',')) {
      const stops = trimmed
        .split(',')
        .map((stop) => stop.trim())
        .filter(Boolean);
      return stops.length >= 2 ? stops : accentFromTone(tone);
    }
    if (prismByTone[trimmed as CardTone]) {
      return accentFromTone(trimmed as CardTone);
    }
    return [trimmed, trimmed];
  }

  return accentFromTone(tone);
}

export function useCardChrome({
  tone = 'neutral',
  variant = 'soft',
  size,
  interactive = false,
  selected = false,
  disabled = false,
  accent = 'auto',
  compact = true,
  className = '',
}: CardChromeOptions) {
  return useMemo(() => {
    const resolvedTone = normalizeTone(tone, variant);
    const toneClass = cardTokens.toneSurfaces[resolvedTone] ?? cardTokens.toneSurfaces.neutral;
    const paddingClass =
      (size && cardTokens.paddingBySize[size]) || (compact ? cardTokens.paddingBySize.sm : cardTokens.paddingBySize.md);
    const variantClass = cardTokens.variantChrome[isCardVariant(variant) ? variant : 'soft'] ?? '';

    const accentStops = resolveAccentStops(accent, resolvedTone);
    const accentHex =
      (Array.isArray(accentStops) && accentStops.length && accentStops[0]) ||
      (accentFromTone(resolvedTone)?.[0] ?? '#60a5fa');
    const accentSoft =
      accentHex && accentHex.startsWith('#') && accentHex.length === 7 ? `${accentHex}99` : accentHex || '#60a5fa99';

    const baseClasses = [
      'relative isolate overflow-hidden',
      toneClass,
      cardTokens.radius,
      paddingClass,
      variantClass,
      'border border-white/10 dark:border-white/10',
      cardTokens.chrome.base,
      'card-glow',
      interactive && cardTokens.chrome.focus,
      interactive && 'focus-visible:outline-none',
      selected && cardTokens.chrome.selected,
      disabled && 'opacity-70',
      'transition-transform transition-shadow',
      'hover:scale-[1.02] focus-visible:scale-[1.02]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const ringClass = accentStops ? 'pointer-events-none absolute inset-0 rounded-[inherit]' : null;
    const ringStyle: CSSProperties | null = accentStops
      ? {
          backgroundImage: `linear-gradient(135deg, ${accentStops.join(', ')})`,
          opacity: selected ? 0.9 : 0.7,
          padding: '2px',
          borderRadius: 'inherit',
          boxSizing: 'border-box',
          pointerEvents: 'none',
          display: 'block',
          zIndex: 1,
          WebkitMask: MASK_LAYER,
          WebkitMaskComposite: 'xor',
          mask: MASK_LAYER,
          maskComposite: 'exclude',
        }
      : null;

    const contentClass = 'relative z-10';

    return {
      containerClass: baseClasses,
      ringClass,
      ringStyle,
      contentClass,
      accentColor: accentHex,
      accentSoft,
    };
  }, [tone, variant, size, interactive, selected, disabled, accent, compact, className]);
}
