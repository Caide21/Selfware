import Link from 'next/link';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: '',
  title: 'About Caide',
  subtitle: 'Who I am, what I build, and how I can help. A personal hub—clear, direct, and human.',
};

const tiles = [
  {
    href: '/caide/identity',
    icon: 'dY�z',
    title: 'Identity',
    copy: 'Background, strengths, and perspective.',
  },
  {
    href: '/caide/about',
    icon: 'dY"o',
    title: 'Story',
    copy: 'Origins, lessons, and the bigger vision.',
  },
  {
    href: '/caide/services',
    icon: "dY'�",
    title: 'Services',
    copy: 'Coaching, sessions, and collaborations.',
  },
  {
    href: '/caide/contact',
    icon: 'dY"�',
    title: 'Contact',
    copy: 'Reach out via email or DM.',
  },
];

export default function CaideHub() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:grid-cols-4">
      {tiles.map((tile) => (
        <Link
          key={tile.href}
          href={tile.href}
          className="rounded-xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-2 text-3xl">{tile.icon}</div>
          <h2 className="text-lg font-semibold text-text">{tile.title}</h2>
          <p className="mt-2 text-sm text-text-muted">{tile.copy}</p>
        </Link>
      ))}
    </div>
  );
}
