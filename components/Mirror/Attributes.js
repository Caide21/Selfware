import { useStatusPanel } from './index';
export default function Attributes() {
  const { attributes } = useStatusPanel();
  return (
    <div className="grid gap-3">
      {attributes.map((a,i)=>(
        <div key={i} className="rounded-2xl p-3 border">
          <div className="text-sm opacity-70">{a.name}</div>
          <div className="text-2xl font-semibold">{String(a.value)}</div>
          {a.scale && <div className="text-xs opacity-60">Scale: {a.scale}</div>}
          {a.notes && <div className="text-xs opacity-60">{a.notes}</div>}
        </div>
      ))}
    </div>
  );
}


