import { supabase } from './supabaseClient';

const debug = process.env.CODEx_DEBUG === '1';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * entries: [{ notion_page_id, title, symbol, description, slug? }]
 * userId: optional; pass null for global Codex
 */
export async function syncCodexIndexToSupabase({ entries, userId = null }) {
  if (!Array.isArray(entries) || entries.length === 0) {
    if (debug) console.log('[CodexSync] No entries supplied for sync');
    return { upserts: 0 };
  }

  const { data: existing, error: exErr } = await supabase
    .from('codex_entries')
    .select('id, slug, notion_page_id, title');

  if (exErr && debug) console.warn('[CodexSync] Select existing error:', exErr);

  const safeExisting = exErr ? [] : existing || [];

  const byNotion = new Map(
    safeExisting.filter((row) => row.notion_page_id).map((row) => [row.notion_page_id, row])
  );
  const bySlug = new Map(safeExisting.map((row) => [row.slug, row]));

  const payload = entries
    .map((entry) => {
      const baseSlug = entry.slug ? slugify(entry.slug) : slugify(entry.title);
      const existingByPage = entry.notion_page_id ? byNotion.get(entry.notion_page_id) : null;
      const existingBySlug = baseSlug ? bySlug.get(baseSlug) : null;
      const finalSlug = existingByPage?.slug || existingBySlug?.slug || baseSlug;

      if (!finalSlug) {
        if (debug) {
          console.warn('[CodexSync] Skipping entry without slug:', entry.title || entry.notion_page_id);
        }
        return null;
      }

      return {
        user_id: userId,
        title: entry.title || 'Untitled',
        slug: finalSlug,
        description: entry.description || null,
        symbol: entry.symbol || null,
        source: 'notion',
        notion_page_id: entry.notion_page_id || null,
      };
    })
    .filter(Boolean);

  if (!payload.length) return { upserts: 0 };

  const { data, error } = await supabase
    .from('codex_entries')
    .upsert(payload, { onConflict: 'slug' })
    .select('id');

  if (error) {
    if (debug) console.error('[CodexSync] Upsert error:', error);
    return { upserts: 0, error };
  }

  if (debug) console.log(`[CodexSync] Upserts: ${data?.length || 0}`);
  return { upserts: data?.length || 0 };
}
