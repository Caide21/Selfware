import { baseCardClasses, hoverClasses } from './cardChrome';

export default function HomeCard({ card }) {
  const data = card || {};

  return (
    <div className={`${baseCardClasses} border-lime-300/80 ${hoverClasses}`}>
      <div className="text-sm font-semibold text-emerald-800">{data.label}</div>
      {data.placeType ? <div className="text-xs text-slate-600">{data.placeType}</div> : null}
    </div>
  );
}
