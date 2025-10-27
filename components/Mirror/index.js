import { create } from 'zustand';
import { supabase } from '../../lib/supabaseClient';

const keepHistory =
  process.env.KEEP_HISTORY === 'true' ||
  process.env.KEEP_HISTORY === '1' ||
  process.env.NEXT_PUBLIC_KEEP_HISTORY === 'true' ||
  process.env.NEXT_PUBLIC_KEEP_HISTORY === '1';

function numOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const useStatusPanel = create((set, get) => ({
  attributes: [],
  conditions: [],
  vitals: [],
  meta: { mood: null, hrv: null, sleep_debt: null, loaded: false },
  loading: false,

  setData: (data) => set(data),
  reset: () => set({ attributes: [], conditions: [], vitals: [], meta: { mood: null, hrv: null, sleep_debt: null, loaded: true } }),

  deriveMetaFromVitals: () => {
    const { vitals } = get();
    const lookup = (key) => {
      const row = vitals.find((v) => String(v.name || '').toLowerCase().trim() === key);
      return row?.value ?? null;
    };
    const mood = lookup('mood');
    const hrv = lookup('hrv');
    const sleepDebt = lookup('sleep debt') ?? lookup('sleep_debt');
    set({ meta: { ...get().meta, mood: numOrNull(mood), hrv: numOrNull(hrv), sleep_debt: numOrNull(sleepDebt) } });
  },

  loadState: async (userId) => {
    if (!userId) {
      set((state) => ({ ...state, meta: { ...state.meta, loaded: true } }));
      return null;
    }

    set({ loading: true });
    const { data, error } = await supabase
      .from('status_panel_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      set({
        attributes: data.attributes ?? [],
        conditions: data.conditions ?? [],
        vitals: data.vitals ?? [],
        meta: {
          mood: data.mood ?? null,
          hrv: data.hrv ?? null,
          sleep_debt: data.sleep_debt ?? null,
          loaded: true,
        },
        loading: false,
      });
      return data;
    }

    set((state) => ({ ...state, meta: { ...state.meta, loaded: true }, loading: false }));
    return null;
  },

  saveState: async (userId) => {
    if (!userId) throw new Error('User id required');
    const { attributes, conditions, vitals, meta } = get();

    if (meta.mood == null || meta.hrv == null || meta.sleep_debt == null) {
      get().deriveMetaFromVitals();
    }

    const payload = {
      user_id: userId,
      attributes,
      conditions,
      vitals,
      mood: get().meta.mood,
      hrv: get().meta.hrv,
      sleep_debt: get().meta.sleep_debt,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('status_panel_state')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) throw error;

    if (keepHistory) {
      await supabase.from('status_panel_history').insert({
        user_id: userId,
        attributes: payload.attributes,
        conditions: payload.conditions,
        vitals: payload.vitals,
        mood: payload.mood,
        hrv: payload.hrv,
        sleep_debt: payload.sleep_debt,
      });
    }
  },

  history: async (userId, limit = 30) => {
    if (!userId) return [];
    const source = keepHistory ? 'status_panel_history' : 'status_panel_state';
    const columns = keepHistory
      ? 'id, created_at, mood, hrv, sleep_debt'
      : 'user_id, updated_at, mood, hrv, sleep_debt';
    const orderColumn = keepHistory ? 'created_at' : 'updated_at';

    const { data, error } = await supabase
      .from(source)
      .select(columns)
      .eq('user_id', userId)
      .order(orderColumn, { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },
}));

export function normalizeRows(rows) {
  const out = { attributes: [], conditions: [], vitals: [] };
  const push = (bucket, r) => {
    bucket.push({
      name: (r.name ?? '').toString().trim(),
      value: coerceValue(r.value),
      scale: r.scale ?? null,
      kind: r.kind ?? null,
      notes: r.notes ?? null,
      tags: ((r.tags ?? '') + '').split(',').map((s) => s.trim()).filter(Boolean),
    });
  };
  for (const r of rows) {
    const section = String(r.section || '').toLowerCase().trim();
    if (section === 'attributes') push(out.attributes, r);
    else if (section === 'conditions') push(out.conditions, r);
    else if (section === 'vitals') push(out.vitals, r);
  }
  return out;
}

function coerceValue(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : (v ?? '').toString().trim();
}
