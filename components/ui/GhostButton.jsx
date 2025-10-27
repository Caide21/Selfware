import Link from 'next/link';

function resolveClass(className = '') {
  return ['inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-text ring-1 ring-slate-300 transition hover:ring-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40', className]
    .filter(Boolean)
    .join(' ');
}

export default function GhostButton({ href, className = '', children, ...props }) {
  const classes = resolveClass(className);
  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
