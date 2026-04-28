import Card from '@/components/CardKit/Card';

type Person = Record<string, any>;

export interface PersonCardProps {
  card?: Person;
  person?: Person;
}

export default function PersonCard({ card, person }: PersonCardProps) {
  const data = card || person || {};

  return (
    <Card
      tone="warning"
      accent="#f59e0b"
      title={data.name || 'Person'}
      subtitle={data.role}
      meta={data.relationshipStatus}
    />
  );
}
