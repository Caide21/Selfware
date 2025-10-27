import React from 'react';
import Link from 'next/link';
import { usePageHeading } from '@/components/Layout/PageShell';

import FocusPanel from '@/components/Mirror/FocusPanel';
import RegulationPanel from '@/components/Mirror/RegulationPanel';
import RecentLogPanel from '@/components/Mirror/RecentLogPanel';
import EmotionSummary from '@/components/Mirror/EmotionSummary';
import FeaturedScrollPanel from '@/components/Mirror/FeaturedScrollPanel';

const PAGE_HEADING = {
  emoji: 'dY�',
  title: 'Human OS Interface',
  subtitle: 'A personalized dashboard for cognitive reflection and emotional navigation.',
};

export default function InterfacePage() {
  const navItems = [
    { label: 'Stats', path: '/status_panel' },
    { label: 'Emotion', path: '/status_panel' },
    { label: 'Tree', path: '/status_panel' },
    { label: 'Spellbook', path: '/status_panel' },
  ];

  const xpPercent = 73;

  const recentLogs = [
    'Completed emotional state tracker',
    'Uploaded current skill tree',
    'Integrated stat tracker interface',
  ];

  const emotions = [
    { symbol: '🌀', name: 'Frustration', intensity: 6, source: 'UI loops' },
    { symbol: '⚡', name: 'Drive', intensity: 8, source: 'Dev sync' },
  ];

  usePageHeading(PAGE_HEADING);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {navItems.map(({ label, path }) => (
          <Link
            key={path}
            href={path}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-text transition hover:-translate-y-1 hover:shadow-lg"
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">XP Progress</div>
        <div className="w-full rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-secondary"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <div className="text-right text-xs font-medium text-text-muted">{xpPercent}%</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FocusPanel focus="Stat Tracker Polishing" />
        <RegulationPanel />
        <EmotionSummary emotions={emotions} />
        <RecentLogPanel logs={recentLogs} />
      </div>

      <div className="pt-2">
        <FeaturedScrollPanel title="Scroll of Emotional Clarity" />
      </div>
    </div>
  );
}
