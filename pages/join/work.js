import { usePageHeading } from '@/components/Layout/PageShell';
import Link from 'next/link';

const PAGE_HEADING = {
  emoji: "dY�",
  title: 'Case Scrolls',
  subtitle:
    'These are not just projects\u2014they\u2019re symbolic artifacts. Each scroll tells a story of systems built with soul.',
};

const caseStudies = [
  {
    title: 'dYO? NexMind Interface',
    copy:
      'A modular symbolic framework for cognitive mirrors. Scroll-driven UX with Tailwind and AI tooling.',
    link: { href: 'https://github.com/Caide21/ProjectAether', label: 'View Repo', external: true },
  },
  {
    title: 'dYOO 3D Scroll Corridor',
    copy:
      'A spatial landing experience: DOM meets R3F. Scrolls, fog, and floating rituals in a corridor of resonance.',
    link: { href: '/codex', label: 'Enter Corridor' },
  },
  {
    title: 'dY"r Resonance Engine',
    copy:
      'In progress: a live reflection tool that reads emotion and mirrors user states through symbolic UI effects.',
    footnote: 'Coming soon…',
  },
  {
    title: 'dY>� Freelance Portal',
    copy: 'This site\u2014modular, expressive, symbolic. Crafted to invite resonance-aligned collaborators.',
    link: { href: '/home', label: 'View Landing' },
  },
];

export default function Work() {
  usePageHeading(PAGE_HEADING);

  return (
    <section className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-10 px-4 md:grid-cols-2">
      {caseStudies.map((item) => (
        <article
          key={item.title}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <h2 className="text-lg font-semibold text-text">{item.title}</h2>
          <p className="mt-3 text-sm text-text-muted">{item.copy}</p>
          {item.link ? (
            item.link.external ? (
              <a
                href={item.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-info hover:underline"
              >
                {item.link.label}
                <span aria-hidden>↗</span>
              </a>
            ) : (
              <Link
                href={item.link.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-info hover:underline"
              >
                {item.link.label}
                <span aria-hidden>→</span>
              </Link>
            )
          ) : null}
          {item.footnote ? (
            <p className="mt-3 text-sm italic text-text-muted">{item.footnote}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}
