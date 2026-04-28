// Simple Supabase adapter for "homemade" cards.
// Keep your existing tables/columns; this just wraps them.
import { supabase } from '@/lib/supabaseClient';

export function useCardPersistence({ table }) {
  async function createCard(values) {
    const { data, error } = await supabase.from(table).insert(values).select().single();
    if (error) window.dispatchEvent(new CustomEvent('cardbuilder-error', { detail: error.message }));
    return { data, error };
  }
  async function updateCard(id, values) {
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
    if (error) window.dispatchEvent(new CustomEvent('cardbuilder-error', { detail: error.message }));
    return { data, error };
  }
  async function deleteCard(id) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) window.dispatchEvent(new CustomEvent('cardbuilder-error', { detail: error.message }));
    return { error };
  }
  async function duplicateCard(id, extra = {}) {
    const { data: src, error: readErr } = await supabase.from(table).select('*').eq('id', id).single();
    if (readErr) {
      window.dispatchEvent(new CustomEvent('cardbuilder-error', { detail: readErr.message }));
      return { error: readErr };
    }
    delete src.id; // let DB assign
    const { data, error } = await supabase.from(table).insert({ ...src, ...extra }).select().single();
    if (error) window.dispatchEvent(new CustomEvent('cardbuilder-error', { detail: error.message }));
    return { data, error };
  }
  return { createCard, updateCard, deleteCard, duplicateCard };
}
