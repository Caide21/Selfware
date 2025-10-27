import React from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import EmotionMap from '@/components/Mirror/EmotionMap';

const PAGE_HEADING = {
  emoji: 'dY�?',
  title: 'Emotional State Tracker',
  subtitle: 'A mirror for your inner weather. Observe, don’t judge.',
};

export default function EmotionPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-4xl px-4">
      <EmotionMap />
    </div>
  );
}
