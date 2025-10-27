import { useStatusPanel } from './index';
export default function Conditions() {
  const { conditions } = useStatusPanel();
  return (
    <div className="grid gap-3">
      {conditions.map((c,i)=>(
        <div key={i} className={`rounded-2xl p-3 border ${c.kind==='buff' ? 'border-green-500/40' : c.kind==='debuff' ? 'border-red-500/40' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm opacity-70">{c.name}</div>
            {c.kind && <span className="text-xs uppercase opacity-70">{c.kind}</span>}
          </div>
          <div className="text-lg">{String(c.value)}</div>
          {c.notes && <div className="text-xs opacity-60">{c.notes}</div>}
        </div>
      ))}
    </div>
  );
}


