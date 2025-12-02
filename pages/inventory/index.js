import { useEffect, useMemo, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import ImportJSON from '@/components/Upload/ImportJSON';
import ExportJSON from '@/components/Upload/ExportJSON';
import InventoryCard from '@/modules/inventory/InventoryCard';
import { useInventoryStore } from '@/stores/inventory';
import { supabase } from '@/lib/supabaseClient';
import { TextInput } from '@/components/Form';

const PAGE_HEADING = {
  emoji: '[]',
  title: 'Inventory',
  subtitle: 'Unified items stored in Supabase.',
};


export default function InventoryPage() {
  usePageHeading(PAGE_HEADING);
  const { items, importJSON, addItem, updateItem, removeItem, exportJSON, fetchInventory, loading } =
    useInventoryStore();
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('');
  const [tag, setTag] = useState('');
  const [user, setUser] = useState(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const resolved = data?.user ?? null;
        setUser(resolved);
        if (resolved?.id) {
          await fetchInventory(resolved.id);
        }
      } catch (error) {
        console.error('Failed to resolve user for inventory', error);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchInventory]);

  const filtered = useMemo(() => {
    const qq = q.toLowerCase();
    return items.filter((it) =>
      (!qq || it.name.toLowerCase().includes(qq)) &&
      (!kind || (it.kind || '').toLowerCase() === kind.toLowerCase()) &&
      (!tag || (Array.isArray(it.tags) && it.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))))
    );
  }, [items, q, kind, tag]);

  const requireUser = () => {
    if (!userId) {
      alert('Sign in required');
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImportJSON
          title="Import JSON"
          onData={async (input) => {
            if (!requireUser()) return;
            try {
              await importJSON(userId, input);
            } catch (error) {
              console.error('Import failed', error);
              alert('Import failed');
            }
          }}
        />
        <ExportJSON filename="inventory.json" getData={() => exportJSON()} />
        <button
          className="ml-auto px-3 py-2 border rounded"
          onClick={async () => {
            if (!requireUser()) return;
            try {
              await addItem(userId, { name: 'New Item' });
            } catch (error) {
              console.error('Create item failed', error);
              alert('Create failed');
            }
          }}
        >
          + New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <TextInput placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <TextInput placeholder="Kind (tool, food, ...)" value={kind} onChange={(e) => setKind(e.target.value)} />
        <TextInput placeholder="Tag" value={tag} onChange={(e) => setTag(e.target.value)} />
        {loading && <div className="text-sm opacity-60 self-center">Loading...</div>}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {filtered.map((it) => {
          const tags = Array.isArray(it.tags) && it.tags.length ? (
            <div className="text-xs opacity-70">{it.tags.join(', ')}</div>
          ) : null;
          const description = it.description || it.details?.description || it.details?.notes || null;
          return (
            <InventoryCard
              key={it.id}
              item={it}
              user={user}
              onAddToLoadout={() => {}}
              onEdit={async () => {
                if (!requireUser()) return;
                const next = prompt('Name', it.name);
                if (next == null) return;
                try {
                await updateItem(userId, it.id, { name: next });
                } catch (error) {
                  console.error('Update item failed', error);
                  alert('Update failed');
                }
              }}
              onDuplicate={async () => {
                if (!requireUser()) return;
                const clone = { ...it, name: `${it.name} (copy)` };
                delete clone.id;
                try {
                  await addItem(userId, clone);
                } catch (error) {
                  console.error('Duplicate item failed', error);
                  alert('Duplicate failed');
                }
              }}
              onRemove={async () => {
                if (!requireUser()) return;
                if (!confirm('Remove this item?')) return;
                try {
                  await removeItem(userId, it.id);
                } catch (error) {
                  console.error('Remove item failed', error);
                  alert('Remove failed');
                }
              }}
            >
              <div className="space-y-2 text-sm text-text/80">
                {description ? <p>{description}</p> : null}
                {tags}
              </div>
            </InventoryCard>
          );
        })}
        {!filtered.length && <div className="text-sm opacity-60">No items</div>}
      </div>
    </div>
  );
}






