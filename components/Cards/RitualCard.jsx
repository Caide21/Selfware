import Card from '@/components/CardKit/Card';

export default function RitualCard({ card, ritual }) {
  const data = card || ritual || {};

  return (
    <Card
      variant="info"
      accent="#818cf8"
      title={data.title || 'Ritual'}
      meta={data.stepCount != null ? `Steps: ${data.stepCount}` : undefined}
    />
  );
}
