import Card from '@/components/CardKit/Card';

export default function EventCard({ card, event }) {
  const data = card || event || {};

  return (
    <Card
      variant="info"
      accent="#60a5fa"
      title={data.title || 'Event'}
      subtitle={data.location}
      meta={data.startTime}
    />
  );
}
