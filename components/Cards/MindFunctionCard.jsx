import { baseCardClasses, hoverClasses } from './cardChrome';

export default function MindFunctionCard({ card }) {
  const data = card || {};
  const tags = Array.isArray(data.tags) ? data.tags : [];

  return (
    <div className={`${baseCardClasses} border-purple-300/80 ${hoverClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-purple-800">{data.alias}</div>
        {data.trainedLevel !== undefined ? (
          <span className="text-xs font-medium text-purple-600">Lv {data.trainedLevel}</span>
        ) : null}
      </div>
      {data.description ? <div className="text-xs text-slate-600">{data.description}</div> : null}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1 text-[11px] text-purple-700">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-purple-50 px-2 py-[2px] border border-purple-200/80">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
