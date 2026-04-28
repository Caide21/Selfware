import Card from '@/components/CardKit/Card';

type EmotionalState = Record<string, any>;

export interface EmotionalStateCardProps {
  card?: EmotionalState;
}

export default function EmotionalStateCard({ card }: EmotionalStateCardProps) {
  const data = card || {};

  return (
    <Card tone="busy" accent="#f472b6" title={data.summary || 'Emotional state'} meta="State">
      <div className="flex items-center gap-3 text-sm text-text/70">
        <span>Energy: {data.energy ?? '--'}</span>
        <span>Clarity: {data.clarity ?? '--'}</span>
      </div>
    </Card>
  );
}
