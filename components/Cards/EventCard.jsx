import { baseCardClasses, hoverClasses } from './cardChrome';

export default function EventCard({ card, event }) {
  const data = card || event || {};

  return (
    <div className={`${baseCardClasses} border-blue-300/80 ${hoverClasses}`}>
      <div className="text-sm font-semibold text-blue-700">{data.title}</div>
      <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
        <span>{data.startTime}</span>
        {data.location ? <span className="text-slate-500">{data.location}</span> : null}
      </div>
    </div>
  );
}
