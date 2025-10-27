import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import LoadoutEditor from '@/components/Loadouts/LoadoutEditor';
import { useLoadoutStore } from '@/stores/loadouts';
import { useInventoryStore } from '@/stores/inventory';
import { supabase } from '@/lib/supabaseClient';

export default function LoadoutDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    loadouts,
    fetchLoadouts,
    updateLoadoutMeta,
    addItemToLoadout,
    updateLoadoutItem,
    removeLoadoutItem,
    equipToday,
  } = useLoadoutStore();
  const { items: inventoryItems, fetchInventory } = useInventoryStore();

  const loadout = useMemo(() => loadouts.find((l) => l.id === id) || null, [loadouts, id]);
  const [nameDraft, setNameDraft] = useState(loadout?.name || '');
  const [userId, setUserId] = useState(null);
  const [savingName, setSavingName] = useState(false);
  const [equipping, setEquipping] = useState(false);

  const headingConfig = useMemo(() => {
    if (!id) return null;
    if (!loadout) {
      return { emoji: '[]', title: 'Loadout Not Found', subtitle: '' };
    }
    return {
      emoji: '[]',
      title: loadout.name || 'Loadout',
      subtitle: 'Select inventory items and configure membership.',
    };
  }, [id, loadout]);

  usePageHeading(headingConfig);

  useEffect(() => {
    setNameDraft(loadout?.name || '');
  }, [loadout?.id, loadout?.name]);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const uid = data?.user?.id ?? null;
        setUserId(uid);
        if (!uid) return;
        await Promise.all([
          fetchLoadouts(uid),
          fetchInventory(uid),
        ]);
      } catch (error) {
        console.error('Failed to bootstrap loadout detail', error);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchLoadouts, fetchInventory]);

  const requireUser = () => {
    if (!userId) {
      alert('Sign in required');
      return false;
    }
    return true;
  };

  const handleSaveName = async () => {
    if (!loadout || !requireUser()) return;
    const trimmed = nameDraft.trim();
    if (trimmed === (loadout.name || '')) return;
    try {
      setSavingName(true);
      await updateLoadoutMeta(userId, loadout.id, { name: trimmed });
    } catch (error) {
      console.error('Failed to update loadout name', error);
      alert('Update failed');
    } finally {
      setSavingName(false);
    }
  };

  const handleAddItem = async (itemId) => {
    if (!loadout || !requireUser()) return;
    try {
      await addItemToLoadout(userId, loadout.id, itemId, {});
    } catch (error) {
      console.error('Failed to add item to loadout', error);
      alert('Add failed');
    }
  };

  const handleUpdateItem = async (loadoutItemId, patch) => {
    if (!requireUser()) return;
    try {
      await updateLoadoutItem(userId, loadoutItemId, patch);
    } catch (error) {
      console.error('Failed to update loadout item', error);
      alert('Update failed');
    }
  };

  const handleRemoveItem = async (loadoutItemId) => {
    if (!requireUser()) return;
    if (!confirm('Remove this item from the loadout?')) return;
    try {
      await removeLoadoutItem(userId, loadoutItemId);
    } catch (error) {
      console.error('Failed to remove loadout item', error);
      alert('Remove failed');
    }
  };

  const handleEquip = async () => {
    if (!loadout || !requireUser()) return;
    try {
      setEquipping(true);
      await equipToday(userId, loadout.id);
    } catch (error) {
      console.error('Failed to equip loadout', error);
      alert('Equip failed');
    } finally {
      setEquipping(false);
    }
  };

  if (!id) {
    return null;
  }

  if (!loadout) {
    return <div className="text-sm opacity-60">No loadout with id {String(id || '')}.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <button
          className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-text hover:border-primary/50 hover:text-primary transition"
          onClick={() => router.push('/loadouts')}
          aria-label="Back to loadouts list"
        >
          Back to Loadouts
        </button>
        <input
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          onBlur={handleSaveName}
          placeholder="Name this loadout..."
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40 min-h-[40px] placeholder:text-text-muted"
        />
        <button
          className="rounded-full bg-cta-accent px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleSaveName}
          disabled={savingName}
        >
          {savingName ? 'Saving...' : 'Save Name'}
        </button>
      </div>

      <LoadoutEditor
        loadout={loadout}
        inventory={inventoryItems}
        onAddItem={handleAddItem}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
        onEquipToday={handleEquip}
        equipping={equipping}
      />
    </div>
  );
}

