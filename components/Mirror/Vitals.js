import { useStatusPanel } from './index';
export default function Vitals() {
  const { vitals } = useStatusPanel();
  return (
    <div className="grid gap-3">
      {vitals.map((v,i)=>(
        <div key={i} className="rounded-2xl p-3 border">
          <div className="text-sm opacity-70">{v.name}</div>
          <div className="text-2xl font-semibold">{String(v.value)}</div>
          {v.scale && <div className="text-xs opacity-60">Scale: {v.scale}</div>}
          {v.notes && <div className="text-xs opacity-60">{v.notes}</div>}
        </div>
      ))}
    </div>
  );
}


