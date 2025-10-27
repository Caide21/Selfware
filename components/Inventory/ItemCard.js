export default function ItemCard({ item, onEdit, onDuplicate, onRemove, onAddToLoadout }) {
  const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';
  return (
    <div className="rounded-2xl p-3 border space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{item.name}</div>
        {item.qty != null && <div className="text-sm opacity-70">x{item.qty}</div>}
      </div>
      {tags && <div className="text-xs opacity-70">{tags}</div>}
      <div className="flex gap-2 text-xs">
        <button className="px-2 py-1 border rounded" onClick={onEdit}>Edit</button>
        <button className="px-2 py-1 border rounded" onClick={onDuplicate}>Duplicate</button>
        <button className="px-2 py-1 border rounded" onClick={onRemove}>Remove</button>
        <button className="px-2 py-1 border rounded" onClick={onAddToLoadout}>Add to Loadout…</button>
      </div>
    </div>
  );
}


