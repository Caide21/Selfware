import PlaceholderView from '@/components/Selfware/PlaceholderView';

const MODULES = [
  {
    title: 'Practice Log',
    copy: 'A future tracker for sessions, reps, notes, and what changed during practice.',
  },
  {
    title: 'Momentum View',
    copy: 'A placeholder for visible streaks, milestones, friction, and next actions.',
  },
  {
    title: 'Real-World Feedback',
    copy: 'Future entries can connect progress to actual outcomes instead of abstract points.',
  },
];

export default function BossaProgressPage() {
  return (
    <PlaceholderView
      title="Bossa Progress"
      subtitle="First real-world tracking zone"
      description="Bossa Progress is the first dedicated real-world tracking surface. For now, it is only a route and placeholder UI for future practice data."
      modules={MODULES}
    />
  );
}
