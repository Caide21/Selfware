import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import Card from '@/components/CardKit/Card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import GhostButton from '@/components/ui/GhostButton';
import { usePageHeading } from '@/components/Layout/PageShell';
import { PortalCard } from '@/components/Selfware/PlaceholderView';
import { userOwnsAnyHousehold } from '@/lib/households';
import { supabase } from '@/lib/supabaseClient';

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
    title: 'My Finance OS',
    copy: 'Private income, expenses, loans, repayments, and cash-up cashHome totals.',
    accent: '#34d399',
  },
  {
    href: '/shared-finance',
    title: 'Move-Out HQ',
    copy: 'Track what you need, what is contributed, and how close the mission is.',
    accent: '#34d399',
  },
  {
    href: '/bossa-income',
    title: 'Bossa Tracking',
    copy: 'Cashups and optional table detail from Notes.',
    accent: '#f59e0b',
  },
];

export default function CharacterPortalPage() {
  const [showAdminMemberLookup, setShowAdminMemberLookup] = useState(false);

  usePageHeading(PAGE_HEADING);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setShowAdminMemberLookup(false);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        const userId = data?.user?.id;
        if (!userId || cancelled) return;

        const isOwner = await userOwnsAnyHousehold(supabase, userId);
        if (!cancelled) setShowAdminMemberLookup(isOwner);
      } catch (roleError) {
        console.warn('Portal admin visibility check failed', roleError);
        if (!cancelled) setShowAdminMemberLookup(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const portalLinks = useMemo(() => {
    if (!showAdminMemberLookup) return PORTAL_LINKS;

    return [
      ...PORTAL_LINKS,
      {
        href: '/admin/members',
        title: 'Admin / Member Lookup',
        copy: 'Find user IDs and manage shared access.',
        accent: '#60a5fa',
      },
    ];
  }, [showAdminMemberLookup]);

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
          {portalLinks.map((link) => (
            <PortalCard key={link.href} {...link} />
          ))}
        </div>
      </section>
    </>
  );
}
