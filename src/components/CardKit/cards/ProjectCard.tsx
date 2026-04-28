import Card from '@/components/CardKit/Card';

type Project = Record<string, any>;

export interface ProjectCardProps {
  card?: Project;
  project?: Project;
}

export default function ProjectCard({ card, project }: ProjectCardProps) {
  const data = card || project || {};

  return (
    <Card
      tone="info"
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
