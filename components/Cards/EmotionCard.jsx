import Card from '@/components/CardKit/Card';

export default function EmotionCard({ card, emotion }) {
  const data = card || emotion || {};

  return (
    <Card
      variant="danger"
      accent="#fb7185"
      title={data.label || 'Emotion'}
      meta={data.intensity !== undefined ? `Intensity ${data.intensity}/10` : undefined}
    >
      {data.note ? <div className="text-sm text-text/70">{data.note}</div> : null}
    </Card>
  );
}
