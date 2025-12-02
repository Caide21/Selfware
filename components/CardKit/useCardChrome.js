import { useMemo } from 'react';
import { cardTokens, accentFromVariant, prismByVariant } from './tokens';

const MASK_LAYER = 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)';

function resolveAccentStops(accent, variant) {
  if (accent === false || accent === 'none') {
    return null;
  }

  if (accent == null || accent === 'auto') {
    return accentFromVariant(variant);
  }

  if (Array.isArray(accent)) {
    const stops = accent.filter(Boolean);
    return stops.length >= 2 ? stops : accentFromVariant(variant);
  }

  if (typeof accent === 'string') {
    const trimmed = accent.trim();
    if (!trimmed || trimmed === 'auto') {
      return accentFromVariant(variant);
    }
    if (trimmed === 'none') {
      return null;
    }
    if (trimmed.includes(',')) {
      const stops = trimmed.split(',').map((stop) => stop.trim()).filter(Boolean);
      return stops.length >= 2 ? stops : accentFromVariant(variant);
    }
    if (prismByVariant[trimmed]) {
      return accentFromVariant(trimmed);
    }
  }

  return accentFromVariant(variant);
}

export function useCardChrome({
  variant = 'neutral',
  accent = 'auto',
  compact = true,
  interactive = false,
  selected = false,
  className = '',
}) {
  return useMemo(() => {
    const variantClass = cardTokens.variants[variant] ?? cardTokens.variants.neutral;
    const paddingClass = compact ? 'p-3' : 'p-4';

    const baseClasses = [
      'relative isolate overflow-hidden',
      variantClass,
      cardTokens.radius,
      paddingClass,
      'border border-white/10 dark:border-white/10',
      'shadow-[0_10px_28px_-18px_rgba(15,23,42,0.55)] dark:shadow-[0_12px_34px_-20px_rgba(0,0,0,0.75)]',
      cardTokens.chrome.base,
      interactive && cardTokens.chrome.focus,
      interactive && 'focus-visible:outline-none',
      selected && cardTokens.chrome.selected,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const accentStops = resolveAccentStops(accent, variant);
    const ringClass = accentStops ? 'pointer-events-none absolute inset-0 rounded-[inherit]' : null;
    const ringStyle = accentStops
      ? {
          backgroundImage: `linear-gradient(135deg, ${accentStops.join(', ')})`,
          opacity: selected ? 0.85 : 0.65,
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
    };
  }, [variant, accent, compact, interactive, selected, className]);
}
