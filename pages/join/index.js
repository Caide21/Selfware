import Link from 'next/link';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: 'dY?',
  title: 'Join Us',
  subtitle: 'Choose how you\u2019d like to connect or collaborate.',
};

const options = [
  {
    href: '/join/contact',
    label: 'Contact',
    icon: 'dY"�',
  },
  {
    href: '/join/work',
    label: 'Work With Us',
    icon: "dY'�",
  },
  {
    href: '/join/friends',
    label: 'Allies',
    icon: 'dY`�',
  },
  {
    href: '/join/login',
    label: 'Login',
    icon: 'dY"?',
  },
];

export default function JoinIndex() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto grid max-w-xl grid-cols-1 gap-4 px-4 sm:grid-cols-2">
      {options.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-center transition hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="text-2xl">{option.icon}</div>
          <div className="mt-2 text-base font-semibold text-text">{option.label}</div>
        </Link>
      ))}
    </div>
  );
}
