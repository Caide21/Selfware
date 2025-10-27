import { useEffect, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import { supabase } from '@/lib/supabaseClient';

const DEBUG_ALLOWED = process.env.NODE_ENV !== 'production' || process.env.DEBUG_DB === '1';

const resources = [
  { key: 'inventory_items', label: 'inventory_items', filter: (query, userId) => query.eq('user_id', userId) },
  { key: 'loadouts', label: 'loadouts', filter: (query, userId) => query.eq('user_id', userId) },
  { key: 'loadout_items', label: 'loadout_items' },
  { key: 'status_panel_state', label: 'status_panel_state', filter: (query, userId) => query.eq('user_id', userId) },
  { key: 'status_panel_history', label: 'status_panel_history', optional: true, filter: (query, userId) => query.eq('user_id', userId) },
  { key: 'v_loadouts_expanded', label: 'v_loadouts_expanded', filter: (query, userId) => query.eq('user_id', userId) },
];

export default function DebugDbPage() {
  const heading = DEBUG_ALLOWED
    ? { emoji: '[]', title: 'DB Debug', subtitle: 'Supabase table counts' }
    : { emoji: '[]', title: 'DB Debug', subtitle: 'Disabled in this environment' };

  usePageHeading(heading);
  const [userId, setUserId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancelled) return;
        setUserId(data?.user?.id ?? null);
      } catch (error) {
        console.error('Debug DB: failed to resolve user', error);
      }
    };
    if (DEBUG_ALLOWED) {
      fetchUser();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!DEBUG_ALLOWED || !userId) return;
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      const results = [];
      for (const res of resources) {
        try {
          let query = supabase.from(res.key).select('id', { head: true, count: 'exact' });
          if (res.filter) {
            query = res.filter(query, userId);
          }
          const { count, error } = await query;
          if (cancelled) return;
          if (error) throw error;
          results.push({ key: res.key, label: res.label, ok: true, count: count ?? 0, optional: res.optional });
        } catch (error) {
          if (cancelled) return;
          results.push({ key: res.key, label: res.label, ok: false, error: error.message, optional: res.optional });
        }
      }
      setRows(results);
      setLoading(false);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ready = DEBUG_ALLOWED && userId;

  if (!DEBUG_ALLOWED) {
    return (
      <div className="p-4 text-sm opacity-70">
        Enable DEBUG_DB=1 or run outside production to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!userId && <div className="text-sm opacity-70">Sign in required.</div>}
      {loading && <div className="text-sm opacity-70">Checking tables...</div>}
      {ready && (
        <div className="grid gap-3">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
              <div>
                <div className="font-semibold">{row.label}</div>
                {row.optional && <div className="text-xs opacity-60">optional</div>}
                {!row.ok && <div className="text-xs text-red-400">{row.error}</div>}
              </div>
              <div className={row.ok ? 'text-green-300' : 'text-red-300'}>
                {row.ok ? `ok (${row.count})` : 'error'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


