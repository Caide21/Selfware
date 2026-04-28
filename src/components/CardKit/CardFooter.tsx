import type { ReactNode } from 'react';
import { cardTokens } from './tokens';

export interface CardFooterProps {
  children?: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  if (!children) return null;

  const footerClass = [cardTokens.footer, className].filter(Boolean).join(' ');
  return <footer className={footerClass}>{children}</footer>;
}
