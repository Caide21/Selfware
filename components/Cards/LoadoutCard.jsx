import { baseCardClasses, hoverClasses } from './cardChrome';

export default function LoadoutCard({ card, loadout }) {
  const data = card || loadout || {};
  const linkedCount = Array.isArray(data.linkedItems) ? data.linkedItems.length : data.linkedCount ?? 0;

  return (
    <div className={`${baseCardClasses} border-teal-300/80 ${hoverClasses}`}>
      <div className="text-sm font-semibold text-teal-800">{data.name}</div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="font-medium uppercase tracking-wide text-teal-700">{data.mode}</span>
        <span>{linkedCount} linked</span>
      </div>
    </div>
  );
}
