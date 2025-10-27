import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePageHeading } from '@/components/Layout/PageShell';
import LoadoutCard from '@/components/Loadouts/LoadoutCard';
import { useLoadoutStore } from '@/stores/loadouts';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '[]',
  title: 'Loadouts',
  subtitle: 'Selections sourced from normalized Supabase tables.',
};

export default function LoadoutsPage() {
  const router = useRouter();
  const {
    loadouts,
    todayLoadoutId,
    fetchLoadouts,
    createLoadout,
    deleteLoadout,
    equipToday,
    loading,
  } = useLoadoutStore();
  const [userId, setUserId] = useState(null);
  const [equipping, setEquipping] = useState(null);

  usePageHeading(PAGE_HEADING);

  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        const uid = data?.user?.id ?? null;
        setUserId(uid);
        if (uid) {
          await fetchLoadouts(uid);
        }
      } catch (error) {
        console.error('Failed to resolve user for loadouts', error);
      }
    };
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [fetchLoadouts]);

  const requireUser = () => {
    if (!userId) {
      alert('Sign in required');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!requireUser()) return;
    try {
      const id = await createLoadout(userId, { name: 'New Loadout' });
      router.push(`/loadouts/${id}`);
    } catch (error) {
      console.error('Failed to create loadout', error);
      alert('Create failed');
    }
  };

  const handleDelete = async (id) => {
    if (!requireUser()) return;
    if (!confirm('Delete this loadout?')) return;
    try {
      await deleteLoadout(userId, id);
    } catch (error) {
      console.error('Failed to delete loadout', error);
      alert('Delete failed');
    }
  };

  const handleEquip = async (id) => {
    if (!requireUser()) return;
    try {
      setEquipping(id);
      await equipToday(userId, id);
    } catch (error) {
      console.error('Failed to equip loadout', error);
      alert('Equip failed');
    } finally {
      setEquipping(null);
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            className="rounded-full bg-cta-accent px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg hover:brightness-110"
            onClick={handleCreate}
          >
            New Loadout
          </button>
          {loading && <div className="text-sm opacity-60">Loading...</div>}
        </div>

      <div className="grid md:grid-cols-3 gap-3">
        {loadouts.map((l) => (
          <LoadoutCard
            key={l.id}
            loadout={{ ...l, isToday: l.is_today || l.id === todayLoadoutId }}
            onEquipToday={handleEquip}
            onDelete={handleDelete}
            equipping={equipping === l.id}
          />
        ))}
        {!loadouts.length && <div className="text-sm opacity-60">No loadouts</div>}
      </div>
    </div>
  );
}
