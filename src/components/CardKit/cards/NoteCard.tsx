import Card from '@/components/CardKit/Card';

type Note = Record<string, any>;

export interface NoteCardProps {
  card?: Note;
  note?: Note;
}

export default function NoteCard({ card, note }: NoteCardProps) {
  const data = card || note || {};

  return (
    <Card tone="neutral" title={data.title} accent="#94a3b8">
      {data.body ? <div className="whitespace-pre-line text-sm text-text/70">{data.body}</div> : null}
    </Card>
  );
}
