import { baseCardClasses, hoverClasses } from './cardChrome';

export default function StatCard({ card, stat }) {
  const data = card || stat || {};

  return (
    <div className={`${baseCardClasses} border-emerald-400/70 ${hoverClasses}`}>
      <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Stat</div>
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-semibold text-emerald-700">{data.value ?? '--'}</div>
        {data.unit ? <div className="text-sm text-slate-500">{data.unit}</div> : null}
      </div>
      <div className="text-sm font-medium text-slate-900">{data.label}</div>
    </div>
  );
}
