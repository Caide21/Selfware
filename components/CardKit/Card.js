import React, { forwardRef } from 'react';
import { useCardChrome } from './useCardChrome';
import { cardTokens } from './tokens';

const Card = forwardRef(function Card(
  {
    title,
    subtitle,
    meta,
    icon,
    media,
    children,
    footer,
    variant = 'neutral',
    accent = 'auto',
    compact = true,
    interactive = false,
    selected = false,
    onClick,
    className = '',
    'data-test': dataTest,
    role,
    style,
    ...rest
  },
  ref
) {
  const { containerClass, ringClass, ringStyle, contentClass, accentColor, accentSoft } = useCardChrome({
    variant,
    accent,
    compact,
    interactive,
    selected,
    className,
  });
  const computedRole = role ?? (interactive && onClick ? 'button' : undefined);

  return (
    <div
      ref={ref}
      data-test={dataTest}
      className={containerClass}
      onClick={interactive ? onClick : undefined}
      role={computedRole}
      style={{
        '--card-accent': accentColor,
        '--card-accent-soft': accentSoft,
        ...style,
      }}
      {...rest}
    >
      {ringClass ? <span aria-hidden className={ringClass} style={ringStyle ?? undefined} /> : null}
      <div className={contentClass}>
        {(title || subtitle || icon || meta) && (
          <header className={cardTokens.header}>
            <div className="flex min-w-0 items-center gap-2">
              {icon ? <span className="shrink-0">{icon}</span> : null}
              <div className="min-w-0">
                {title && <h3 className={cardTokens.title}>{title}</h3>}
                {subtitle && <div className={cardTokens.subtitle}>{subtitle}</div>}
              </div>
            </div>
            {meta && <div className={cardTokens.meta}>{meta}</div>}
          </header>
        )}
        {media}
        {children && <div className={cardTokens.body}>{children}</div>}
        {footer && <footer className={cardTokens.footer}>{footer}</footer>}
      </div>
    </div>
  );
});

export default Card;
