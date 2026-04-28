import type { ReactNode } from 'react';
import { cardTokens } from './tokens';

export interface CardBodyProps {
  children?: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  if (!children) return null;

  const bodyClass = [cardTokens.body, className].filter(Boolean).join(' ');
  return <div className={bodyClass}>{children}</div>;
}
