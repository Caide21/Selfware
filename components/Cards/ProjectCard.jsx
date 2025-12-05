import { baseCardClasses, hoverClasses } from './cardChrome';

export default function ProjectCard({ card, project }) {
  const data = card || project || {};

  return (
    <div className={`${baseCardClasses} border-indigo-400/80 ${hoverClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-indigo-800">{data.name}</div>
        {data.priority ? (
          <span className="text-[11px] uppercase tracking-wide text-indigo-700 border border-indigo-200/80 rounded-full px-2 py-0.5">
            {data.priority}
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Status: {data.status || 'pending'}</span>
        {data.targetDate ? <span className="text-slate-500">Target: {data.targetDate}</span> : null}
      </div>
    </div>
  );
}
