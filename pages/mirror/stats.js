import React from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import StatMap from '@/components/Mirror/StatMap';

const PAGE_HEADING = {
  emoji: 'dY�z',
  title: 'The Mirror: Stat Sheet',
  subtitle: 'Track, reflect, and measure your state in real-time.',
};

export default function StatsPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <StatMap />
    </div>
  );
}
