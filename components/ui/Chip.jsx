import Link from 'next/link';

export default function Chip({ href, className = '', children, ...props }) {
  const classes = [
    'inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-xs font-medium text-text/80 bg-white',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = {
    borderImage: 'linear-gradient(90deg,#7C3AED,#14B8A6 55%,#FB7185) 1',
    borderImageSlice: 1,
  };

  if (href) {
    return (
      <Link href={href} className={classes} style={style} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <span className={classes} style={style} {...props}>
      {children}
    </span>
  );
}
