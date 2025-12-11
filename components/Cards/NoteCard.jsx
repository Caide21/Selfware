import Card from '@/components/CardKit/Card';

export default function NoteCard({ card, note }) {
  const data = card || note || {};

  return (
    <Card variant="neutral" title={data.title} accent="#94a3b8">
      {data.body ? <div className="text-sm text-text/70 whitespace-pre-line">{data.body}</div> : null}
    </Card>
  );
}
