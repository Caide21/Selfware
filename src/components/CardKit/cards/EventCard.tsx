import Card from '@/components/CardKit/Card';

type EventData = Record<string, any>;

export interface EventCardProps {
  card?: EventData;
  event?: EventData;
}

export default function EventCard({ card, event }: EventCardProps) {
  const data = card || event || {};

  return (
    <Card tone="info" accent="#60a5fa" title={data.title || 'Event'} subtitle={data.location} meta={data.startTime} />
  );
}
