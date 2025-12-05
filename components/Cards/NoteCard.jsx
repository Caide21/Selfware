import { baseCardClasses, hoverClasses } from './cardChrome';

export default function NoteCard({ card, note }) {
  const data = card || note || {};

  return (
    <div className={`${baseCardClasses} border-slate-300/80 ${hoverClasses}`}>
      {data.title ? <div className="text-sm font-semibold text-slate-900">{data.title}</div> : null}
      {data.body ? <div className="text-sm text-slate-600">{data.body}</div> : null}
    </div>
  );
}
