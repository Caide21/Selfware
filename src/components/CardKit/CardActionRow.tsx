import type { ReactNode } from 'react';
import { cardTokens } from './tokens';

export interface CardActionRowProps {
  children?: ReactNode;
  className?: string;
}

export function CardActionRow({ children, className = '' }: CardActionRowProps) {
  if (!children) return null;

  const rowClass = [cardTokens.actionRow, className].filter(Boolean).join(' ');
  return <div className={rowClass}>{children}</div>;
}
