import { renderCard } from '@/components/Cards/cardRegistry';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: '[]',
  title: 'Dev Playground',
  subtitle: 'Habit card prototype using Status Panel chrome',
};

const MOCK_CARDS = [
  {
    id: 'habit-morning-stretch',
    type: 'habit',
    title: 'Morning stretch (5 minutes)',
    description: 'Light full-body stretch to wake up the system.',
    frequency: 'daily',
    scheduleSummary: 'Daily @ morning',
    streakCount: 14,
    bestStreak: 21,
    todayStatus: 'pending',
    lastCompletedLabel: 'yesterday',
  },
  {
    id: 'quest-card-registry',
    type: 'quest',
    title: 'Ship the Card Registry',
    status: 'In progress',
    xpValue: 120,
    projectName: 'Selfware',
  },
  {
    id: 'stat-deep-work',
    type: 'stat',
    label: 'Deep work today',
    value: 2.5,
    unit: 'hrs',
  },
  {
    id: 'note-mirror-loops',
    type: 'note',
    title: 'Mirror loops',
    body: 'Short scratchpad note about iterative self-audit rituals.',
  },
  {
    id: 'inventory-focus-tea',
    type: 'inventory',
    itemName: 'Focus tea',
    quantity: 12,
    unit: 'bags',
    valuePerUnit: '$1',
  },
  {
    id: 'loadout-daily-ops',
    type: 'loadout',
    name: 'Daily Ops',
    mode: 'Active',
    linkedCount: 5,
  },
  {
    id: 'mind-function-pattern',
    type: 'mindFunction',
    alias: 'Pattern Match',
    description: 'Quickly connect disparate signals into options.',
    trainedLevel: 3,
    tags: ['analysis', 'intuition'],
  },
  {
    id: 'project-v2',
    type: 'project',
    name: 'Selfware v2',
    status: 'Planning',
    priority: 'P1',
    targetDate: '2025-12-31',
  },
  {
    id: 'person-mentor',
    type: 'person',
    name: 'Alex Rivera',
    role: 'Mentor',
    relationshipStatus: 'Warm',
  },
  {
    id: 'ritual-shutdown',
    type: 'ritual',
    title: 'Evening shutdown',
    stepCount: 4,
  },
  {
    id: 'event-sync',
    type: 'event',
    title: 'Team sync',
    startTime: '10:00 AM',
    location: 'VC room',
  },
  {
    id: 'emotion-calm',
    type: 'emotion',
    label: 'Calm focus',
    intensity: 4,
    note: 'Centered, steady.',
  },
  {
    id: 'emotional-state-grounded',
    type: 'emotionalState',
    summary: 'Grounded & curious',
    energy: 'medium',
    clarity: 'high',
  },
  {
    id: 'home-base',
    type: 'home',
    label: 'Loft Studio',
    placeType: 'Home base',
  },
];

export default function DevPlaygroundPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-5xl mx-auto grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_CARDS.map((card) => (
          <div key={card.id}>{renderCard(card)}</div>
        ))}
      </div>
    </div>
  );
}
