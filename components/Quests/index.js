import { supabase } from '@/lib/supabaseClient';
import { betweenIndex, spacedIndex, toNum } from './ordering';

const DEBUG_SUPABASE = false;

function logDebug(...args) {
  if (!DEBUG_SUPABASE) return;
  console.log('[Supabase:quests]', ...args);
}

function logError(label, error) {
  if (!error) return;
  console.error('[Supabase:quests]', label, {
    status: error.status,
    message: error.message,
    hint: error.hint,
    details: error.details,
  });
}

export async function assertAuthed() {
  const { data, error } = await supabase.auth.getSession();
  if (error) logError('auth.getSession', error);
  const userId = data?.session?.user?.id || null;
  logDebug('auth', { userId, ok: Boolean(userId) });
  return { ok: Boolean(userId), userId };
}

async function requireAuthed(actionLabel) {
  const { ok, userId } = await assertAuthed();
  if (!ok) {
    const err = new Error('Not signed in');
    err.code = 'AUTH_REQUIRED';
    throw err;
  }
  logDebug('intent', { action: actionLabel, userId });
}

// ---------- READ ----------
export async function fetchQuests() {
  await requireAuthed('fetchQuests');
  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .order('category', { ascending: true })
    .order('parent_id', { ascending: true, nullsFirst: true })
    .order('order_index', { ascending: true });
  if (error) logError('fetchQuests', error);
  if (error) throw error;
  return data ?? [];
}

// ---------- ORDERING HELPERS ----------
export async function nextIndex(parentId, category) {
  const q = supabase.from('quests').select('order_index').eq('category', category);
  parentId == null ? q.is('parent_id', null) : q.eq('parent_id', parentId);
  const { data, error } = await q.order('order_index', { ascending: false }).limit(1);
  if (error) throw error;
  const last = toNum(data?.[0]?.order_index, 0);
  return last + 100;
}

export async function reindexGroup(parentId, category) {
  await requireAuthed('reindexGroup');
  const q = supabase.from('quests').select('id').eq('category', category);
  parentId == null ? q.is('parent_id', null) : q.eq('parent_id', parentId);
  const { data, error } = await q.order('order_index', { ascending: true });
  if (error) throw error;
  const updates = (data ?? []).map((row, i) => ({ id: row.id, order_index: spacedIndex(i) }));
  if (updates.length === 0) return;
  for (const update of updates) {
    const { error: upErr } = await supabase
      .from('quests')
      .update({ order_index: update.order_index })
      .eq('id', update.id);
    if (upErr) {
      logError('reindexGroup', upErr);
      throw upErr;
    }
  }
}

async function getIndex(id) {
  const { data, error } = await supabase.from('quests').select('order_index').eq('id', id).single();
  if (error) throw error;
  return toNum(data?.order_index, 0);
}

// ---------- CREATE ----------
export async function createQuest({
  title,
  difficulty = 'easy',
  category = 'side',
  timeLimit = '',
  extraInfo = '',
  status = null,
  xpValue = null,
  xp_value = null,
  orderIndex = null,
}) {
  await requireAuthed('createQuest');
  const idx = await nextIndex(null, category);
  const resolvedOrderIndex = orderIndex ?? idx;
  logDebug('intent', { action: 'createQuest', category, order_index: resolvedOrderIndex });
  const row = {
    title: String(title || '').trim(),
    difficulty: normalizeDiff(difficulty),
    category,
    parent_id: null,
    order_index: resolvedOrderIndex,
    time_limit: timeLimit || null,
    extra_info: String(extraInfo || '').trim() || null,
    status: status || null,
    xp_value: xp_value ?? xpValue ?? null,
  };
  const { data, error } = await supabase.from('quests').insert(row).select('*').single();
  if (error) logError('createQuest', error);
  if (error) throw error;
  return data;
}

export async function createSubquest(parent, { title, difficulty = 'easy', timeLimit = '', extraInfo = '' }) {
  await requireAuthed('createSubquest');
  const idx = await nextIndex(parent.id, parent.category);
  const row = {
    title: String(title || '').trim(),
    difficulty: normalizeDiff(difficulty),
    category: parent.category,
    parent_id: parent.id,
    order_index: idx,
    time_limit: timeLimit || null,
    extra_info: String(extraInfo || '').trim() || null,
  };
  const { data, error } = await supabase.from('quests').insert(row).select('*').single();
  if (error) logError('createSubquest', error);
  if (error) throw error;
  return data;
}

// ---------- UPDATE ----------
export async function updateQuest(id, patch) {
  await requireAuthed('updateQuest');
  // normalize fields
  const _patch = { ...patch };
  if ('difficulty' in _patch) _patch.difficulty = normalizeDiff(_patch.difficulty);
  if ('timeLimit' in _patch) { _patch.time_limit = _patch.timeLimit; delete _patch.timeLimit; }
  if ('xpValue' in _patch) { _patch.xp_value = _patch.xpValue; delete _patch.xpValue; }
  const { error } = await supabase.from('quests').update(_patch).eq('id', id);
  if (error) logError('updateQuest', error);
  if (error) throw error;
}

// ---------- MOVE (reparent + reorder precisely) ----------
export async function moveQuest({ id, targetParentId, targetCategory, beforeId = null, afterId = null }) {
  await requireAuthed('moveQuest');
  logDebug('intent', {
    questId: id,
    parent_id: targetParentId ?? null,
    category: targetCategory,
    beforeId,
    afterId,
  });
  let newIdx = betweenIndex(
    beforeId ? { order_index: await getIndex(beforeId) } : null,
    afterId  ? { order_index: await getIndex(afterId) }  : null
  );
  if (newIdx == null) {
    await reindexGroup(targetParentId, targetCategory);
    newIdx = betweenIndex(
      beforeId ? { order_index: await getIndex(beforeId) } : null,
      afterId  ? { order_index: await getIndex(afterId) }  : null
    );
  }
  const patch = { parent_id: targetParentId, category: targetCategory, order_index: newIdx };
  const { error } = await supabase.from('quests').update(patch).eq('id', id);
  if (error) logError('moveQuest', error);
  if (error) throw error;
}

// ---------- DELETE ----------
export async function deleteQuest(id) {
  const { error } = await supabase.from('quests').delete().eq('id', id);
  if (error) throw error;
}

// util
function normalizeDiff(d) {
  const s = String(d || '').toLowerCase();
  return s === 'hard' || s === 'medium' || s === 'easy' ? s : 'easy';
}

const questsApi = {
  fetchQuests,
  createQuest,
  createSubquest,
  updateQuest,
  moveQuest,
  deleteQuest,
  nextIndex,
  reindexGroup,
};

export default questsApi;


