import { baseCardClasses, hoverClasses } from './cardChrome';

export default function PersonCard({ card, person }) {
  const data = card || person || {};

  return (
    <div className={`${baseCardClasses} border-amber-300/80 ${hoverClasses}`}>
      <div className="text-sm font-semibold text-amber-800">{data.name}</div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{data.role}</span>
        {data.relationshipStatus ? <span className="text-amber-700 font-medium">{data.relationshipStatus}</span> : null}
      </div>
    </div>
  );
}
