import { baseCardClasses, hoverClasses } from './cardChrome';

export default function EmotionalStateCard({ card }) {
  const data = card || {};

  return (
    <div
      className={`${baseCardClasses} border-rose-200/80 bg-gradient-to-r from-rose-50/70 to-sky-50/70 ${hoverClasses}`}
    >
      <div className="text-sm font-semibold text-rose-700">{data.summary}</div>
      <div className="flex items-center gap-3 text-xs text-slate-600">
        <span>Energy: {data.energy ?? '--'}</span>
        <span>Clarity: {data.clarity ?? '--'}</span>
      </div>
    </div>
  );
}
