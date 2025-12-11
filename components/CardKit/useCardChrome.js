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
    // Treat any other color string as a flat gradient with that color
    return [trimmed, trimmed];
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
  if (process.env.NODE_ENV === 'development') {
    // TEMP: debug to see where CardKit is used
    // eslint-disable-next-line no-console
    console.log('[CardKit] useCardChrome', { variant, accent, compact, interactive, selected, className });
  }

  return useMemo(() => {
    const variantClass = cardTokens.variants[variant] ?? cardTokens.variants.neutral;
    const paddingClass = compact ? 'p-3' : 'p-4';

    const accentStops = resolveAccentStops(accent, variant);
    const accentHex =
      (Array.isArray(accentStops) && accentStops.length && accentStops[0]) ||
      (accentFromVariant(variant)?.[0] ?? '#60a5fa');
    const accentSoft =
      accentHex && accentHex.startsWith('#') && accentHex.length === 7 ? `${accentHex}99` : accentHex || '#60a5fa99';

    const baseClasses = [
      'relative isolate overflow-hidden',
      variantClass,
      cardTokens.radius,
      paddingClass,
      'border border-white/10 dark:border-white/10',
      cardTokens.chrome.base,
      'card-glow',
      interactive && cardTokens.chrome.focus,
      interactive && 'focus-visible:outline-none',
      selected && cardTokens.chrome.selected,
      'transition-transform transition-shadow',
      'hover:scale-[1.02] focus-visible:scale-[1.02]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const ringClass = accentStops ? 'pointer-events-none absolute inset-0 rounded-[inherit]' : null;
    const ringStyle = accentStops
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
  }, [variant, accent, compact, interactive, selected, className]);
}
