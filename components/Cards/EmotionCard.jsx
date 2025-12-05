import { baseCardClasses, hoverClasses } from './cardChrome';

export default function EmotionCard({ card, emotion }) {
  const data = card || emotion || {};

  return (
    <div className={`${baseCardClasses} border-rose-300/80 ${hoverClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-rose-700">{data.label}</div>
        {data.intensity !== undefined ? (
          <span className="text-xs font-medium text-rose-600">Intensity {data.intensity}/10</span>
        ) : null}
      </div>
      {data.note ? <div className="text-xs text-slate-600">{data.note}</div> : null}
    </div>
  );
}
