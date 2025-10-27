import { useMemo, useState } from 'react';
import { TextInput, TextAreaAuto } from '@/components/Form';

export default function LoadoutEditor({
  loadout,
  inventory,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onEquipToday,
  equipping,
}) {
  const [filter, setFilter] = useState('');
  const items = loadout?.items ?? [];

  const filteredInventory = useMemo(() => {
    const q = filter.toLowerCase();
    return inventory.filter((it) => it.name.toLowerCase().includes(q));
  }, [inventory, filter]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2">Inventory</h3>
        <TextInput
          className="mb-2 text-sm"
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="grid gap-2">
          {filteredInventory.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div>{it.name}</div>
              <button className="px-2 py-1 border rounded" onClick={() => onAddItem(it.id)}>Add</button>
            </div>
          ))}
          {!filteredInventory.length && <div className="text-sm opacity-60">No items</div>}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold mb-2">Loadout Items</h3>
          <button className="px-2 py-1 border rounded text-xs" onClick={onEquipToday} disabled={equipping}>
            {equipping ? 'Equipping...' : 'Equip Today'}
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          {items.map((entry) => (
            <div key={entry.id} className="rounded border p-3 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{entry.item?.name || entry.item_id}</div>
                <button className="px-2 py-1 border rounded" onClick={() => onRemoveItem(entry.id)}>Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs space-y-1">
                  <span className="block uppercase tracking-wide opacity-60">Quantity</span>
                  <TextInput
                    className="px-2 py-1"
                    placeholder="--"
                    value={entry.quantity ?? ''}
                    onChange={(ev) => {
                      const next = ev.target.value;
                      if (next === '') {
                        onUpdateItem(entry.id, { quantity: null });
                        return;
                      }
                      const parsed = Number(next);
                      onUpdateItem(entry.id, { quantity: Number.isFinite(parsed) ? parsed : null });
                    }}
                  />
                </label>
                <label className="text-xs space-y-1">
                  <span className="block uppercase tracking-wide opacity-60">Notes</span>
                  <TextAreaAuto
                    className="px-2 py-1"
                    placeholder="Context"
                    value={entry.notes ?? ''}
                    onChange={(ev) => onUpdateItem(entry.id, { notes: ev.target.value })}
                  />
                </label>
              </div>
            </div>
          ))}
          {!items.length && <div className="text-sm opacity-60">No items selected</div>}
        </div>
      </div>
    </div>
  );
}
