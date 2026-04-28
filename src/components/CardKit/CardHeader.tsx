import type { ReactNode } from 'react';
import { cardTokens } from './tokens';

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  rightSlot?: ReactNode;
}

export function CardHeader({ title, subtitle, meta, icon, rightSlot }: CardHeaderProps) {
  if (!title && !subtitle && !icon && !meta && !rightSlot) {
    return null;
  }

  return (
    <header className={cardTokens.header}>
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <div className="min-w-0">
          {title ? <h3 className={cardTokens.title}>{title}</h3> : null}
          {subtitle ? <div className={cardTokens.subtitle}>{subtitle}</div> : null}
        </div>
      </div>
      {(meta || rightSlot) && (
        <div className="flex items-start gap-2">
          {meta ? <div className={cardTokens.meta}>{meta}</div> : null}
          {rightSlot}
        </div>
      )}
    </header>
  );
}
