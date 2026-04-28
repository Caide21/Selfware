import PlaceholderView from '@/components/Selfware/PlaceholderView';

const MODULES = [
  {
    title: 'Progress Layer',
    copy: 'A future visual surface for seeing movement across quests, skills, and zones.',
  },
  {
    title: 'Pattern Threads',
    copy: 'A placeholder for showing links between notes, reflections, rituals, and repeated signals.',
  },
  {
    title: 'Map States',
    copy: 'Future visual states can show what is active, blocked, dormant, or growing.',
  },
];

export default function LivingMapPage() {
  return (
    <PlaceholderView
      title="Living Map"
      subtitle="Visual progress layer"
      description="The Living Map is reserved for the visual layer of Selfware: progress, relationships, patterns, and the shape of the system over time."
      modules={MODULES}
    />
  );
}
