import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

/** @typedef {import('@/lib/supabaseTypes').Loadout} Loadout */
/** @typedef {import('@/lib/supabaseTypes').LoadoutItemRow} LoadoutItemRow */

function normalizeLoadoutItems(raw, loadoutId) {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const item = entry.item ?? entry.inventory_item ?? null;
    const rowId = entry.id ?? entry.loadout_item_id ?? entry.item_id;
    return {
      id: rowId,
      loadout_id: entry.loadout_id ?? loadoutId ?? null,
      item_id: entry.item_id ?? item?.id ?? null,
      quantity: entry.quantity ?? null,
      notes: entry.notes ?? null,
      item,
    };
  });
}

function mapLoadoutRow(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    tags: Array.isArray(row.tags) ? row.tags : [],
    is_today: Boolean(row.is_today),
    items: normalizeLoadoutItems(row.items, row.id),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function computeTodayId(loadouts) {
  const today = loadouts.find((l) => l.is_today);
  return today ? today.id : null;
}

export const useLoadoutStore = create((set, get) => ({
  /** @type {Loadout[]} */
  loadouts: [],
  todayLoadoutId: null,
  loading: false,
  error: null,

  async fetchLoadouts(userId) {
    if (!userId) {
      set({ loadouts: [], todayLoadoutId: null, loading: false, error: null });
      return [];
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('v_loadouts_expanded')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      set({ loading: false, error });
      throw error;
    }

    const mapped = (data || []).map(mapLoadoutRow);
    set({ loadouts: mapped, todayLoadoutId: computeTodayId(mapped), loading: false, error: null });
    return mapped;
  },

  async refreshLoadout(userId, loadoutId) {
    if (!userId || !loadoutId) return null;
    const { data, error } = await supabase
      .from('v_loadouts_expanded')
      .select('*')
      .eq('user_id', userId)
      .eq('id', loadoutId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const updated = mapLoadoutRow(data);
    const next = get().loadouts.some((l) => l.id === loadoutId)
      ? get().loadouts.map((l) => (l.id === loadoutId ? updated : l))
      : [...get().loadouts, updated];
    set({ loadouts: next, todayLoadoutId: computeTodayId(next) });
    return updated;
  },

  async createLoadout(userId, partial = {}) {
    if (!userId) throw new Error('User id required');
    const payload = {
      user_id: userId,
      name: (partial.name || 'New Loadout').trim() || 'Untitled Loadout',
      tags: Array.isArray(partial.tags) ? partial.tags : [],
      is_today: Boolean(partial.is_today && partial.is_today !== false),
    };

    const { data, error } = await supabase
      .from('loadouts')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    await get().refreshLoadout(userId, data.id);
    return data.id;
  },

  async updateLoadoutMeta(userId, loadoutId, patch = {}) {
    if (!userId) throw new Error('User id required');
    const payload = {};
    if (Object.prototype.hasOwnProperty.call(patch, 'name')) {
      payload.name = (patch.name || 'Untitled Loadout').trim() || 'Untitled Loadout';
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'tags')) {
      payload.tags = Array.isArray(patch.tags) ? patch.tags : [];
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'is_today')) {
      payload.is_today = Boolean(patch.is_today);
    }

    if (Object.keys(payload).length === 0) return null;

    const { error } = await supabase
      .from('loadouts')
      .update(payload)
      .eq('id', loadoutId)
      .eq('user_id', userId);

    if (error) throw error;

    return get().refreshLoadout(userId, loadoutId);
  },

  async deleteLoadout(userId, loadoutId) {
    if (!userId) throw new Error('User id required');
    const { error } = await supabase
      .from('loadouts')
      .delete()
      .eq('id', loadoutId)
      .eq('user_id', userId);

    if (error) throw error;

    const next = get().loadouts.filter((l) => l.id !== loadoutId);
    set({ loadouts: next, todayLoadoutId: computeTodayId(next) });
  },

  async addItemToLoadout(userId, loadoutId, itemId, options = {}) {
    if (!userId) throw new Error('User id required');
    if (!itemId) throw new Error('Item id required');

    const { data: itemCheck, error: itemError } = await supabase
      .from('inventory_items')
      .select('id')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (itemError || !itemCheck) {
      throw new Error('Inventory item not found for this user');
    }

    const payload = {
      loadout_id: loadoutId,
      item_id: itemId,
      quantity: options.quantity ?? null,
      notes: options.notes ?? null,
    };

    const { error } = await supabase
      .from('loadout_items')
      .insert(payload);

    if (error) throw error;

    return get().refreshLoadout(userId, loadoutId);
  },

  async updateLoadoutItem(userId, loadoutItemId, patch = {}) {
    if (!userId) throw new Error('User id required');
    if (!loadoutItemId) throw new Error('Loadout item id required');

    const payload = {};
    if (Object.prototype.hasOwnProperty.call(patch, 'quantity')) {
      payload.quantity = patch.quantity == null ? null : Number(patch.quantity);
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'notes')) {
      payload.notes = patch.notes == null ? null : String(patch.notes);
    }

    if (Object.keys(payload).length === 0) return null;

    const { data, error } = await supabase
      .from('loadout_items')
      .update(payload)
      .eq('id', loadoutItemId)
      .select('loadout_id')
      .single();

    if (error) throw error;

    return get().refreshLoadout(userId, data.loadout_id);
  },

  async removeLoadoutItem(userId, loadoutItemId) {
    if (!userId) throw new Error('User id required');
    if (!loadoutItemId) throw new Error('Loadout item id required');

    const { data, error } = await supabase
      .from('loadout_items')
      .delete()
      .eq('id', loadoutItemId)
      .select('loadout_id')
      .single();

    if (error) throw error;

    return get().refreshLoadout(userId, data.loadout_id);
  },

  async equipToday(userId, loadoutId) {
    if (!userId) throw new Error('User id required');
    if (!loadoutId) throw new Error('Loadout id required');

    const { error } = await supabase.rpc('equip_today', {
      p_user: userId,
      p_loadout: loadoutId,
    });

    if (error) {
      const code = error?.code || error?.status;
      const message = (error?.message || '').toLowerCase();
      const isMissingRpc =
        code === 'PGRST202' ||
        code === '404' ||
        message.includes('could not find the function') ||
        message.includes('no matches were found');

      if (!isMissingRpc) {
        throw error;
      }

      const { error: clearErr } = await supabase
        .from('loadouts')
        .update({ is_today: false })
        .eq('user_id', userId);
      if (clearErr) throw clearErr;

      const { error: setErr } = await supabase
        .from('loadouts')
        .update({ is_today: true })
        .eq('id', loadoutId)
        .eq('user_id', userId);
      if (setErr) throw setErr;
    }

    await get().fetchLoadouts(userId);
  },
}));
