import Link from 'next/link';

function resolveClass(className = '') {
  return ['inline-flex items-center justify-center rounded-full px-5 py-3 font-semibold text-white bg-rainbow shadow-soft transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50', className]
    .filter(Boolean)
    .join(' ');
}

export default function PrimaryButton({ href, className = '', children, ...props }) {
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
