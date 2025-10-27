import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

/** @typedef {import('@/lib/supabaseTypes').InventoryItem} InventoryItem */

const ROOT_KEYS = new Set(['id', 'user_id', 'name', 'kind', 'location', 'stackable', 'details', 'created_at', 'updated_at']);

function mapInventoryRow(row) {
  const details = row?.details && typeof row.details === 'object' ? row.details : {};
  return {
    ...details,
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    kind: row.kind ?? details.kind ?? null,
    location: row.location ?? details.location ?? null,
    stackable: Boolean(row.stackable ?? details.stackable ?? false),
    details,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

function buildDetails(partial, existingDetails = {}) {
  const next = { ...(existingDetails || {}) };
  if (partial && typeof partial.details === 'object' && partial.details !== null) {
    Object.assign(next, partial.details);
  }
  for (const [key, value] of Object.entries(partial || {})) {
    if (ROOT_KEYS.has(key)) continue;
    next[key] = value;
  }
  return next;
}

export const useInventoryStore = create((set, get) => ({
  /** @type {InventoryItem[]} */
  items: [],
  loading: false,
  error: null,

  async fetchInventory(userId) {
    if (!userId) {
      set({ items: [], loading: false, error: null });
      return [];
    }
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      set({ loading: false, error });
      throw error;
    }

    const mapped = (data || []).map(mapInventoryRow);
    set({ items: mapped, loading: false, error: null });
    return mapped;
  },

  async addItem(userId, partial = {}) {
    if (!userId) throw new Error('User id required');
    const payload = {
      user_id: userId,
      name: (partial.name || 'Untitled Item').trim() || 'Untitled Item',
      kind: partial.kind ?? null,
      location: partial.location ?? null,
      stackable: Boolean(partial.stackable ?? false),
      details: buildDetails(partial),
    };

    const { data, error } = await supabase
      .from('inventory_items')
      .insert(payload)
      .select('*')
      .single();

    if (error) throw error;

    const mapped = mapInventoryRow(data);
    set({ items: [...get().items, mapped] });
    return mapped;
  },

  async updateItem(userId, id, patch = {}) {
    if (!userId) throw new Error('User id required');
    const existing = get().items.find((it) => it.id === id);
    if (!existing) throw new Error('Item not found');

    const payload = { details: buildDetails(patch, existing.details) };

    if (Object.prototype.hasOwnProperty.call(patch, 'name')) {
      payload.name = (patch.name || 'Untitled Item').trim() || 'Untitled Item';
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'kind')) {
      payload.kind = patch.kind ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'location')) {
      payload.location = patch.location ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(patch, 'stackable')) {
      payload.stackable = Boolean(patch.stackable);
    }

    const { data, error } = await supabase
      .from('inventory_items')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;

    const updated = mapInventoryRow(data);
    set({ items: get().items.map((it) => (it.id === id ? updated : it)) });
    return updated;
  },

  async removeItem(userId, id) {
    if (!userId) throw new Error('User id required');
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    set({ items: get().items.filter((it) => it.id !== id) });
  },

  async importJSON(userId, input) {
    if (!userId || !input || typeof input !== 'object') return [];
    const raw = Array.isArray(input.inventory)
      ? input.inventory
      : Array.isArray(input.items)
        ? input.items
        : [];

    const created = [];
    for (const entry of raw) {
      const clone = { ...entry };
      delete clone.id;
      created.push(await get().addItem(userId, clone));
    }
    return created;
  },

  exportJSON() {
    const items = get().items;
    return {
      schema: 'inventory.persistent.v1',
      inventory: items.map((it) => ({
        id: it.id,
        name: it.name,
        kind: it.kind,
        location: it.location,
        stackable: it.stackable,
        details: it.details,
      })),
    };
  },
}));
