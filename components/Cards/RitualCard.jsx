import { baseCardClasses, hoverClasses } from './cardChrome';

export default function RitualCard({ card, ritual }) {
  const data = card || ritual || {};

  return (
    <div className={`${baseCardClasses} border-indigo-300/80 ${hoverClasses}`}>
      <div className="text-sm font-semibold text-indigo-700">{data.title}</div>
      <div className="text-xs text-slate-600">
        Steps: <span className="font-medium text-indigo-600">{data.stepCount ?? 0}</span>
      </div>
    </div>
  );
}
