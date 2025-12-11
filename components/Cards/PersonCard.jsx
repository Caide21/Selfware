import Card from '@/components/CardKit/Card';

export default function PersonCard({ card, person }) {
  const data = card || person || {};

  return (
    <Card
      variant="warning"
      accent="#f59e0b"
      title={data.name || 'Person'}
      subtitle={data.role}
      meta={data.relationshipStatus}
    />
  );
}
