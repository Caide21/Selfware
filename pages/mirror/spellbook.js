import React from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import RitualMap from '@/components/Mirror/RitualMap';

const PAGE_HEADING = {
  emoji: '🪄',
  title: 'The Spellbook',
  subtitle: 'Rituals, blueprints, and personal spells encoded in symbolic grammar.',
};

export default function SpellbookPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <RitualMap />
    </div>
  );
}
