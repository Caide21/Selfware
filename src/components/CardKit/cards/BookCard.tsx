import type { ReactNode } from 'react';
import PurpleSheen from '@/components/Enchantments/PurpleSheen';

export type BookCardProps = {
  title?: string;
  cover?: string;
  subtitle?: string;
  onClick?: () => void;
  width?: number;
  height?: number;
  className?: string;
  children?: ReactNode;
  sheen?: 'hover' | 'always' | 'off';
  sheenDuration?: number;
  sheenDelay?: number;
};

export default function BookCard({
  title = 'Untitled',
  cover = '/neural-web.png',
  subtitle = '',
  onClick,
  width = 560,
  height = 260,
  className = '',
  children,
  sheen = 'hover',
  sheenDuration = 1.25,
  sheenDelay = 0,
}: BookCardProps) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`orbit-border group relative block rounded-2xl border-0 bg-black shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/40 ${className}`}
      style={{ width, height, cursor: interactive ? 'pointer' : 'default' }}
      aria-label={title}
    >
      <img src={cover} alt={title} className="absolute inset-0 h-full w-full object-cover pointer-events-none" draggable={false} />

      <div
        className="absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          background: 'linear-gradient(125deg, rgba(139,92,246,.25), rgba(167,139,250,.20))',
        }}
      />

      {children && <div className="absolute inset-0">{children}</div>}

      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute left-4 right-4 bottom-3">
        <h3 className="text-lg font-semibold text-white drop-shadow-sm">{title}</h3>
        {subtitle ? <p className="mt-0.5 line-clamp-1 text-xs text-white/70">{subtitle}</p> : null}
      </div>

      {sheen !== 'off' && <PurpleSheen always={sheen === 'always'} duration={sheenDuration} delay={sheenDelay} />}
    </button>
  );
}
