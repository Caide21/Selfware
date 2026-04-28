import Card from '@/components/CardKit/Card';

type Emotion = Record<string, any>;

export interface EmotionCardProps {
  card?: Emotion;
  emotion?: Emotion;
}

export default function EmotionCard({ card, emotion }: EmotionCardProps) {
  const data = card || emotion || {};

  return (
    <Card
      tone="danger"
      accent="#fb7185"
      title={data.label || 'Emotion'}
      meta={data.intensity !== undefined ? `Intensity ${data.intensity}/10` : undefined}
    >
      {data.note ? <div className="text-sm text-text/70">{data.note}</div> : null}
    </Card>
  );
}
