import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

export type CardTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'busy';
export type CardSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'solid' | 'soft' | 'outline' | 'ghost';

export type CardAccent = 'auto' | 'none' | string | string[] | false | null | undefined;

export interface CardChromeOptions {
  tone?: CardTone;
  variant?: CardVariant | CardTone; // allow legacy tone-as-variant usage
  size?: CardSize;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  accent?: CardAccent;
  compact?: boolean;
  className?: string;
}

export interface CardFrameProps extends CardChromeOptions {
  title?: ReactNode;
  subtitle?: ReactNode;
  rightSlot?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  media?: ReactNode;
  footer?: ReactNode;
  role?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
  'data-test'?: string;
}
