import React, { forwardRef } from 'react';
import { CardBody } from './CardBody';
import { CardFooter } from './CardFooter';
import { CardHeader } from './CardHeader';
import { useCardChrome } from './useCardChrome';
import type { CardFrameProps } from './types';

const CardFrame = forwardRef<HTMLDivElement, CardFrameProps>(function CardFrame(
  {
    title,
    subtitle,
    rightSlot,
    meta,
    icon,
    media,
    children,
    footer,
    className = '',
    interactive = false,
    selected = false,
    disabled = false,
    tone = 'neutral',
    variant = 'soft',
    size,
    compact = true,
    accent = 'auto',
    ...rest
  },
  ref,
) {
  const { style, onClick, role, ...divProps } = rest;
  const { containerClass, ringClass, ringStyle, contentClass, accentColor, accentSoft } = useCardChrome({
    tone,
    variant,
    size,
    interactive,
    selected,
    disabled,
    accent,
    compact,
    className,
  });

  const computedRole = role ?? (interactive && onClick ? 'button' : undefined);
  const styleWithVars = {
    ...style,
    ['--card-accent' as const]: accentColor,
    ['--card-accent-soft' as const]: accentSoft,
  } as React.CSSProperties;

  return (
    <div
      ref={ref}
      className={containerClass}
      role={computedRole}
      onClick={interactive && !disabled ? onClick : undefined}
      style={styleWithVars}
      {...divProps}
    >
      {ringClass ? <span aria-hidden className={ringClass} style={ringStyle ?? undefined} /> : null}
      <div className={contentClass}>
        {title || subtitle || icon || meta || rightSlot ? (
          <CardHeader title={title} subtitle={subtitle} meta={meta} icon={icon} rightSlot={rightSlot} />
        ) : null}
        {media}
        {children ? <CardBody>{children}</CardBody> : null}
        {footer ? <CardFooter>{footer}</CardFooter> : null}
      </div>
    </div>
  );
});

export default CardFrame;
export { CardFrame };
