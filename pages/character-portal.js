import Head from 'next/head';
import Card from '@/components/CardKit/Card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GhostButton from '@/components/ui/GhostButton';
import { usePageHeading } from '@/components/Layout/PageShell';
import { PortalCard } from '@/components/Selfware/PlaceholderView';

const PAGE_HEADING = {
  emoji: '',
  title: 'Character Portal',
  subtitle: 'A navigation hub for the next Selfware surfaces.',
};

const PORTAL_LINKS = [
  {
    href: '/notes',
    title: 'Notes',
    copy: 'Raw signal capture for thoughts, fragments, observations, and loose sparks.',
    accent: '#22d3ee',
  },
  {
    href: '/reflections',
    title: 'Reflections',
    copy: 'Meaning extraction for reviews, lessons, emotional context, and loop closure.',
    accent: '#a78bfa',
  },
  {
    href: '/living-map',
    title: 'Living Map',
    copy: 'A future visual layer for progress, patterns, relationships, and movement.',
    accent: '#34d399',
  },
  {
    href: '/bossa-progress',
    title: 'Bossa Progress',
    copy: 'The first real-world tracking zone, reserved for practice and visible momentum.',
    accent: '#f59e0b',
  },
  {
    href: '/finance',
    title: 'Finance OS',
    copy: 'A lightweight money movement surface for cashups, retained cash, income, and expenses.',
    accent: '#34d399',
  },
];

export default function CharacterPortalPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <>
      <Head>
        <title>Character Portal</title>
      </Head>
      <section className="mx-auto max-w-6xl space-y-8">
        <Card
          title="Choose the next surface"
          subtitle="Command center routing"
          variant="neutral"
          accent="#22d3ee"
          className="text-left"
        >
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text/75 sm:text-base">
            The Character Portal is the frontend hub for future shared data. For now, it opens the
            doors: notes, reflections, the living map, and Bossa progress.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/notes">Start with Notes</PrimaryButton>
            <GhostButton href="/home">Return Home</GhostButton>
          </div>
        </Card>

        <div className="grid gap-5 sm:grid-cols-2">
          {PORTAL_LINKS.map((link) => (
            <PortalCard key={link.href} {...link} />
          ))}
        </div>
      </section>
    </>
  );
}
