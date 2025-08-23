// components/Cards/BookCard.jsx
import PurpleSheen from '@/components/Enchantments/PurpleSheen';
import BorderRunner from '@/components/Enchantments/BorderRunner';

export default function BookCard({
  title = 'Untitled',
  cover = '/neural-web.png',
  subtitle = '',
  onClick,
  width = 560,
  height = 260,
  className = '',
  children,
  // sheen controls: 'hover' | 'always' | 'off'
  sheen = 'hover',
  sheenDuration = 1.25,
  sheenDelay = 0,
}) {
  const interactive = Boolean(onClick);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative block rounded-2xl border-0 shadow-2xl bg-black focus:outline-none focus:ring-2 focus:ring-white/40 orbit-border ${className}`}
      style={{ width, height, cursor: interactive ? 'pointer' : 'default' }}
      aria-label={title}
    >
      {/* image */}
      <img
        src={cover}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* subtle wash */}
      <div
        className="absolute inset-0 mix-blend-overlay opacity-30"
        style={{
          background:
            'linear-gradient(125deg, rgba(139,92,246,.25), rgba(167,139,250,.20))',
        }}
      />

      {/* optional overlay slot (above image, below HUD) */}
      {children && <div className="absolute inset-0">{children}</div>}

      {/* footer HUD */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute left-4 right-4 bottom-3">
        <h3 className="text-white font-semibold text-lg drop-shadow-sm">{title}</h3>
        {subtitle ? (
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{subtitle}</p>
        ) : null}
      </div>

      {/* ✨ Sheen enchantment */}
      {sheen !== 'off' && (
        <PurpleSheen
          always={sheen === 'always'}
          duration={sheenDuration}
          delay={sheenDelay}
        />
      )}
    </button>
  );
}