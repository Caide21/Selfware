import Card from '@/components/CardKit/Card';

export default function ProjectCard({ card, project }) {
  const data = card || project || {};

  return (
    <Card
      variant="info"
      accent="#6366f1"
      title={data.name || 'Project'}
      meta={data.priority ? String(data.priority).toUpperCase() : undefined}
    >
      <div className="flex items-center justify-between text-xs text-text/70">
        <span>Status: {data.status || 'pending'}</span>
        {data.targetDate ? <span className="text-text/60">Target: {data.targetDate}</span> : null}
      </div>
    </Card>
  );
}
