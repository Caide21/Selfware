import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import ImportJSON from '@/components/Upload/ImportJSON';
import { normalizeBySection, num, splitTags } from '@/lib/import/normalize';
import { supabase } from '@/lib/supabaseClient';
import { useStatusPanel } from '../../components/Mirror';
import { useLoadoutStore } from '@/stores/loadouts';
import { useInventoryStore } from '@/stores/inventory';

const Attributes = dynamic(() => import('../../components/Mirror/Attributes'), { ssr: false });
const Conditions = dynamic(() => import('../../components/Mirror/Conditions'), { ssr: false });
const Vitals = dynamic(() => import('../../components/Mirror/Vitals'), { ssr: false });

const PAGE_HEADING = {
  emoji: '[]',
  title: 'Status Panel',
  subtitle: 'Attributes | Conditions | Vitals synced to Supabase state',
};

export default function StatusPanel() {
  const loadState = useStatusPanel((s) => s.loadState);
  const saveState = useStatusPanel((s) => s.saveState);
  const loaded = useStatusPanel((s) => s.meta.loaded);
  const statusLoading = useStatusPanel((s) => s.loading);
  const setData = useStatusPanel((s) => s.setData);
  const deriveMeta = useStatusPanel((s) => s.deriveMetaFromVitals);
  const [userId, setUserId] = useState(null);
  const [saving, setSaving] = useState(false);

  usePageHeading(PAGE_HEADING);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const uid = data?.user?.id ?? null;
        setUserId(uid);
        if (!uid) {
          return;
        }
        await Promise.all([
          loadState(uid),
          useLoadoutStore.getState().fetchLoadouts(uid),
          useInventoryStore.getState().fetchInventory(uid),
        ]);
      } catch (error) {
        console.error('Failed to bootstrap status panel', error);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [loadState]);

  const todayLoadoutId = useLoadoutStore((s) => s.todayLoadoutId);
  const loadouts = useLoadoutStore((s) => s.loadouts);
  const inventoryItems = useInventoryStore((s) => s.items);

  const todayNames = useMemo(() => {
    if (!todayLoadoutId) return [];
    const loadout = loadouts.find((l) => l.id === todayLoadoutId);
    if (!loadout) return [];
    const byId = new Map(inventoryItems.map((it) => [it.id, it.name]));
    return (loadout.items || [])
      .map((entry) => entry.item?.name || byId.get(entry.item_id) || entry.item_id)
      .filter(Boolean);
  }, [todayLoadoutId, loadouts, inventoryItems]);

  const onSave = async () => {
    if (!userId) {
      alert('Sign in required to save');
      return;
    }
    try {
      setSaving(true);
      await saveState(userId);
    } catch (error) {
      console.error(error);
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const sections = ['attributes', 'conditions', 'vitals'];
  const mapRow = (section, row) => {
    if (section === 'attributes') {
      return {
        name: row.name ?? '',
        value: num(row.value),
        scale: row.scale ?? null,
        notes: row.notes ?? '',
        tags: splitTags(row.tags),
      };
    }
    if (section === 'conditions') {
      const rawKind =
        row.kind ?? (['stress', 'fatigue', 'distraction'].includes((row.name || '').toLowerCase()) ? 'debuff' : 'buff');
      return {
        name: row.name ?? '',
        value: row.level ?? row.state ?? row.value ?? '',
        notes: row.notes ?? '',
        kind: String(rawKind).toLowerCase(),
        tags: splitTags(row.tags),
      };
    }
    if (section === 'vitals') {
      return {
        name: row.name ?? '',
        value: num(row.value ?? row.score),
        scale: row.scale ?? null,
        notes: row.notes ?? '',
        tags: splitTags(row.tags),
      };
    }
    return row;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <ImportJSON
          title="Import JSON"
          onData={(input) => {
            const sectioned = normalizeBySection(input, sections, mapRow);
            setData(sectioned);
            deriveMeta();
          }}
        />
        {!loaded && <div className="text-sm opacity-60">Loading latest...</div>}
        {statusLoading && <div className="text-sm opacity-60">Fetching status...</div>}
        {todayNames.length > 0 && (
          <div className="text-sm opacity-80">
            Today&apos;s Kit: {todayNames.slice(0, 5).join(', ')}
            {todayNames.length > 5 ? ` +${todayNames.length - 5} more` : ''}
          </div>
        )}
        <div>
          <button className="mt-2 px-4 py-2 border rounded-xl" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save State'}
          </button>
        </div>
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Attributes</h2>
          <Attributes />
        </div>
        <div>
          <h2 className="font-semibold mb-2">Conditions</h2>
          <Conditions />
        </div>
        <div>
          <h2 className="font-semibold mb-2">Vitals</h2>
          <Vitals />
        </div>
      </section>
    </div>
  );
}
