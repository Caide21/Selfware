import React from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import SkillMap from '@/components/Mirror/SkillMap';

const PAGE_HEADING = {
  emoji: 'dYO3',
  title: 'Skill Tree',
  subtitle: 'Evolving abilities, visualized and nurtured. Watch your patterns grow.',
};

export default function SkillTreePage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <SkillMap />
    </div>
  );
}
