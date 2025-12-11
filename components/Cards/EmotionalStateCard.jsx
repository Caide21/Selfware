import Card from '@/components/CardKit/Card';

export default function EmotionalStateCard({ card }) {
  const data = card || {};

  return (
    <Card
      variant="busy"
      accent="#f472b6"
      title={data.summary || 'Emotional state'}
      meta="State"
    >
      <div className="flex items-center gap-3 text-sm text-text/70">
        <span>Energy: {data.energy ?? '--'}</span>
        <span>Clarity: {data.clarity ?? '--'}</span>
      </div>
    </Card>
  );
}
