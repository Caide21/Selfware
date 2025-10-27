export default function CapacityMeter({ used = 0, total = 0 }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="h-2 bg-neutral-800 rounded overflow-hidden">
        <div className="h-2 bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs opacity-70">{used} / {total} ({pct}%)</div>
    </div>
  );
}


