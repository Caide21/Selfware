import Card from '@/components/CardKit/Card';

type Ritual = Record<string, any>;

export interface RitualCardProps {
  card?: Ritual;
  ritual?: Ritual;
}

export default function RitualCard({ card, ritual }: RitualCardProps) {
  const data = card || ritual || {};

  return (
    <Card
      tone="info"
      accent="#818cf8"
      title={data.title || 'Ritual'}
      meta={data.stepCount != null ? `Steps: ${data.stepCount}` : undefined}
    />
  );
}
