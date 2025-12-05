import { baseCardClasses, hoverClasses } from './cardChrome';

export default function InventoryCard({ card, item }) {
  const data = card || item || {};

  return (
    <div className={`${baseCardClasses} border-slate-300/80 ${hoverClasses}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-900">{data.itemName}</div>
        <div className="text-xs font-medium text-teal-700">
          {data.quantity ?? 0}
          {data.unit ? ` ${data.unit}` : ''}
        </div>
      </div>
      {data.valuePerUnit ? (
        <div className="text-xs text-slate-600">Value per unit: {data.valuePerUnit}</div>
      ) : null}
    </div>
  );
}
