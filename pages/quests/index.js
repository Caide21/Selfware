// pages/quests/index.js
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import QuestCard from '@/modules/quests/QuestCard';
import { usePageHeading } from '../../components/Layout/PageShell';
import SelectMenu from '../../components/ui/QuestSelectMenu';
import InlineComposer from '../../components/Quests/InlineComposer';
import { supabase } from '../../lib/supabaseClient';
import { fetchQuests as apiFetchQuests, updateQuest as apiUpdateQuest, createQuest as apiCreateQuest, createSubquest as apiCreateSubquest, moveQuest as apiMoveQuest, deleteQuest as apiDeleteQuest, nextIndex as apiNextIndex, reindexGroup as apiReindexGroup } from '@/components/Quests';
import { TextInput, TextAreaAuto } from '@/components/Form';
import { hasEditAccess } from '@/lib/auth/permissions';

import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

const PAGE_HEADING = {
  emoji: 'ï¿½s"ï¿½,?',
  title: 'Quests',
  subtitle: 'Track your goals and progress with structured quests',
};


// ---- DnD exact placement helpers
export const INDENT_PX = 24;

export function depthOf(id, parentMap) {
  let d = 0, cur = parentMap.get(id);
  while (cur) { d++; cur = parentMap.get(cur); }
  return d;
}

export function ancestorAtDepth(id, targetDepth, parentMap) {
  // depth 0 means top-level (no parent)
  let path = [id];
  let cur = parentMap.get(id);
  while (cur) { path.push(cur); cur = parentMap.get(cur); }
  const currentDepth = path.length - 1;
  if (targetDepth <= 0) return null;
  const idx = Math.max(1, currentDepth - targetDepth);
  return path[idx - 1] ?? null; // parent id at desired depth
}

export function siblingsOf(parentId, lane, all) {
  return all.filter(q => (q.parent_id || null) === (parentId || null) && q.category === lane)
            .sort((a,b) =>
              (a.order_index ?? 0) - (b.order_index ?? 0)
              || new Date(a.created_at) - new Date(b.created_at));
}

// (indexing handled by unified API)

// Utility: input <-> ISO helpers
function toLocalInputValue(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function QuestsPage() {
  // Data
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);

  // Inline form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    difficulty: 'easy',
    category: 'side',
    timeLimit: '',
    extraInfo: '',
    parentId: null,
  });

  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);

  const sessionUserId = sessionUser?.id ?? null;
  const canEditAll = hasEditAccess(sessionUser);

  const canEditQuest = (quest) => {
    if (!quest || !sessionUser) return false;
    if (canEditAll) return true;
    if (!quest.owner_id) return true;
    return quest.owner_id === sessionUserId;
  };

  usePageHeading(PAGE_HEADING);

  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) {
          setSessionUser(data?.user || null);
        }
      })
      .catch((error) => console.error('Failed to resolve session user for quests', error));
    return () => {
      cancelled = true;
    };
  }, []);

  // Expand/collapse
  const [expanded, setExpanded] = useState({});
  const isExpanded = (id) => !!expanded[id];
  const toggleExpand = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  // dnd-kit
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Track mouse for hit testing
  useEffect(() => {
    const onMove = (e) => {
      window.__dnd_clientY = e.clientY;
      window.__dnd_clientX = e.clientX;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  function beginDrag(id) {
    const quest = quests.find((q) => q.id === id);
    if (!canEditQuest(quest)) return;
    setActiveId(id);
  }
  function endDrag() { setActiveId(null); }

  // Build children map for subtree rendering
  const childrenMap = useMemo(() => {
    const m = new Map();
    for (const q of quests) {
      if (q.parent_id) {
        if (!m.has(q.parent_id)) m.set(q.parent_id, []);
        m.get(q.parent_id).push(q.id);
      }
    }
    return m;
  }, [quests]);

  // Map: childId -> parentId (null for top-level)
  const parentMap = useMemo(() => {
    const m = new Map();
    for (const q of quests) m.set(q.id, q.parent_id || null);
    return m;
  }, [quests]);

  // True if `ancestorId` is an ancestor of `nodeId`
  function isAncestor(ancestorId, nodeId) {
    let cur = parentMap.get(nodeId);
    while (cur) {
      if (cur === ancestorId) return true;
      cur = parentMap.get(cur);
    }
    return false;
  }

  // Debug helper: show path from root to node (for â€œwhere did it go?â€)
  function pathOf(id) {
    const names = [];
    let cur = id;
    while (cur) {
      const q = quests.find(x => x.id === cur);
      if (!q) break;
      names.push(q.title || String(cur));
      cur = parentMap.get(cur);
    }
    names.reverse();
    return names.join(' / ');
  }

  // Data load
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        await reloadQuests();
      } catch (e) {
        if (active) setLoadError(e?.message || 'Failed to load quests');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  async function reloadQuests() {
    const data = await apiFetchQuests();
    setQuests(data);
  }

  async function getSessionUser() {
    if (sessionUser) return sessionUser;
    const { data } = await supabase.auth.getUser();
    const user = data?.user || null;
    setSessionUser(user);
    return user;
  }

  async function ensureOwnership(id) {
    const user = await getSessionUser();
    if (!user) return { ok: false, msg: 'Not signed in.' };
    if (hasEditAccess(user)) return { ok: true };
    const { error } = await supabase
      .from('quests')
      .update({ owner_id: user.id })
      .eq('id', id)
      .is('owner_id', null);
    if (error) return { ok: false, msg: error.message };
    return { ok: true };
  }

  // Lane selectors
  const mainQuests = useMemo(() => quests.filter(q => q.category === 'main' && !q.parent_id), [quests]);
  const sideQuests = useMemo(() => quests.filter(q => q.category === 'side' && !q.parent_id), [quests]);
  const inactiveQuests = useMemo(() => quests.filter(q => q.category === 'inactive' && !q.parent_id), [quests]);

  const mainIds = useMemo(() => mainQuests.map(q => q.id), [mainQuests]);
  const sideIds = useMemo(() => sideQuests.map(q => q.id), [sideQuests]);
  const inactiveIds = useMemo(() => inactiveQuests.map(q => q.id), [inactiveQuests]);

  // CRUD helpers
  function setField(name, value) { setForm(f => ({ ...f, [name]: value })); }
  function openAdd() {
    setEditingId(null);
    setForm({ title: '', difficulty: 'easy', category: 'side', timeLimit: '', extraInfo: '', parentId: null });
    setShowForm(true);
  }
  function openEdit(id) {
    const q = quests.find(x => x.id === id);
    if (!q) return;
    setEditingId(id);
    setForm({
      title: q.title || '',
      difficulty: q.difficulty || 'easy',
      category: q.category || 'side',
      timeLimit: q.time_limit ? toLocalInputValue(q.time_limit) : '',
      extraInfo: q.extra_info ?? '',
      parentId: q.parent_id || null,
    });
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); }

  async function saveForm(e) {
    e?.preventDefault?.();
    setActionError(null);
    setSaving(true);
    const user = await getSessionUser();
    if (!user) { setSaving(false); setActionError('You must be signed in.'); return; }
    const payload = {
      title: form.title.trim(),
      difficulty: form.difficulty,
      category: form.category,
      time_limit: form.timeLimit ? new Date(form.timeLimit).toISOString() : null,
      extra_info: form.extraInfo?.trim() || null,
      parent_id: form.parentId || null,
      owner_id: user.id,
    };
    if (!payload.title) { setSaving(false); return; }
    if (editingId) {
      await ensureOwnership(editingId);
      const { error } = await supabase.from('quests').update(payload).eq('id', editingId);
      if (error) setActionError(error.message);
    } else {
      const { error } = await supabase.from('quests').insert(payload);
      if (error) setActionError(error.message);
    }
    await reloadQuests();
    setSaving(false);
    setShowForm(false);
  }

  async function updateQuestInline(id, payload) {
    try {
      const user = await getSessionUser();
      const ownerId = user?.id || null;
      await apiUpdateQuest(id, { ...payload, owner_id: ownerId });
      await reloadQuests();
    } catch (e) {
      setActionError(e.message);
    }
  }

  async function deleteQuest(id) {
    const ok = window.confirm('Delete this quest and its subquests?');
    if (!ok) return;
    await ensureOwnership(id);
    try {
      await apiDeleteQuest(id);
      await reloadQuests();
    } catch (e) { setActionError(e.message); }
  }

  async function moveToLane(lane, id) {
    const { error } = await supabase.from('quests').update({ category: lane, parent_id: null }).eq('id', id);
    if (error) setActionError(error.message);
    await reloadQuests();
  }

  async function reparentUnder(targetId, childId) {
    if (targetId === childId) return;
    const parent = quests.find(q => q.id === targetId);
    if (!parent) return;
    try {
      await apiMoveQuest({ id: childId, targetParentId: targetId, targetCategory: parent.category, beforeId: null, afterId: null });
      await reloadQuests();
    } catch (e) { setActionError(e.message); }
  }

  async function moveSiblingRelative({ referenceId, movingId, place }) {
    const ref = quests.find(q => q.id === referenceId);
    if (!ref) return;
    const parentId = ref.parent_id || null;
    const lane = ref.category;
    try {
      // we don't know exact neighbor at this entry point; reindex group to make space around ref
      await apiReindexGroup(parentId, lane);
      const beforeId = place === 'before' ? quests.find(q => q.parent_id === parentId && q.category === lane && q.order_index < ref.order_index)?.id ?? null : ref.id;
      const afterId  = place === 'after'  ? quests.find(q => q.parent_id === parentId && q.category === lane && q.order_index > ref.order_index)?.id ?? null : ref.id;
      await apiMoveQuest({ id: movingId, targetParentId: parentId, targetCategory: lane, beforeId, afterId });
      await reloadQuests();
    } catch (e) { setActionError(e.message); }
  }

  // Indentation helper
  function indentClass(depth) {
    if (depth <= 0) return '';
    if (depth === 1) return 'ml-6';
    if (depth === 2) return 'ml-12';
    if (depth === 3) return 'ml-16';
    return 'ml-20';
  }

  // ---- Subtree
  function renderSubtree(parentId, depth = 1) {
    const kids = (childrenMap.get(parentId) || [])
      .map(id => quests.find(q => q.id === id))
      .filter(Boolean);

    return (
      <SortableContext items={kids.map(k => k.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {kids.map(child => (
            <div key={child.id}>
              <div className={indentClass(depth)}>
                <QuestCard
                  id={child.id}
                  dataId={child.id}
                  depth={depth}
                  title={child.title}
                  difficulty={child.difficulty}
                  timeLimit={child.time_limit}
                  extraInfo={child.extra_info}
                  category={child.category}
                  isDragging={activeId === child.id}
                  onDragStartCard={beginDrag}
                  onUpdate={updateQuestInline}
                  onDelete={deleteQuest}
                  onClickBody={() => toggleExpand(child.id)}
                  isExpanded={isExpanded(child.id)}
                  onSaved={reloadQuests}
                  canEdit={canEditQuest(child)}
                />
              </div>
              {renderSubtree(child.id, depth + 1)}
            </div>
          ))}
        </div>
      </SortableContext>
    );
  }

  // ---- Lane section component (with droppable area + heading)
  function LaneSection({ lane, title, items, ids }) {
    const { setNodeRef } = useDroppable({ id: `lane:${lane}` });
    return (
      <section ref={setNodeRef} className="mb-10">
        <div className="mb-2 text-sm font-semibold text-zinc-400 uppercase tracking-wider">{title}</div>
        <div className="rounded-xl border border-zinc-800/60 p-3">
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">{/* gaps between top-level quests */}
              {items.map(q => (
                <div key={q.id}>
                <QuestCard
                    id={q.id}
                    dataId={q.id}
                    depth={0}
                    title={q.title}
                    difficulty={q.difficulty}
                    timeLimit={q.time_limit}
                    extraInfo={q.extra_info}
                    category={q.category}
                    isDragging={activeId === q.id}
                    onDragStartCard={beginDrag}
                    onUpdate={updateQuestInline}
                    onDelete={deleteQuest}
                    onClickBody={() => toggleExpand(q.id)}
                  isExpanded={isExpanded(q.id)}
                  onSaved={reloadQuests}
                  canEdit={canEditQuest(q)}
                  />
                  {renderSubtree(q.id, 1)}
                </div>
              ))}
            </div>
          </SortableContext>
        </div>
      </section>
    );
  }

  const activeQuest = useMemo(() => quests.find((q) => q.id === activeId) || null, [quests, activeId]);

  return (
    <>
      <Head>
        <title>Quests</title>
      </Head>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={openAdd}
            className="rounded-xl px-3 py-2 border border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Add Quest
          </button>
        </div>

        {loading && <div className="text-sm text-zinc-500">Loading quests…</div>}
        {loadError && <div className="text-sm text-rose-600">Error: {loadError}</div>}

        {!loading && !loadError && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={({ active }) => beginDrag(active.id)}
            onDragEnd={async ({ active, over }) => {
              try {
                if (!over) {
                  endDrag();
                  return;
                }

                const activeId = active.id;
                const activeQuest = quests.find((q) => q.id === activeId);
                if (!canEditQuest(activeQuest)) {
                  endDrag();
                  return;
                }
                const overId = over.id;

                if (typeof overId === 'string' && overId.startsWith('lane:')) {
                  const lane = overId.split(':')[1];
                  const sibs = siblingsOf(null, lane, quests);
                  const last = sibs[sibs.length - 1];
                  const newIdx = (last?.order_index ?? 0) + 100;
                  await supabase
                    .from('quests')
                    .update({ category: lane, parent_id: null, order_index: newIdx })
                    .eq('id', activeId);
                  await reloadQuests();
                  endDrag();
                  return;
                }

                const overEl = document.querySelector(`[data-quest-id="${overId}"]`);
                if (!overEl) {
                  endDrag();
                  return;
                }

                const rect = overEl.getBoundingClientRect();
                const cx = window.__dnd_clientX ?? 0;
                const cy = window.__dnd_clientY ?? 0;
                const relX = cx - rect.left;
                const relY = cy - rect.top;

                const overItem = quests.find((q) => q.id === overId);
                const overLane = overItem.category;
                const overDepth = depthOf(overId, parentMap);

                const depthIntent = Math.max(0, Math.round((relX - 16) / INDENT_PX));
                const place = relY < rect.height / 2 ? 'before' : 'after';

                const desiredDepth =
                  place === 'before' || place === 'after'
                    ? Math.min(overDepth + depthIntent, overDepth + 1)
                    : overDepth + 1;

                const parentId =
                  desiredDepth <= overDepth
                    ? ancestorAtDepth(overId, desiredDepth - 1, parentMap)
                    : overId;

                if (isAncestor(activeId, parentId)) {
                  endDrag();
                  return;
                }

                const sibs = siblingsOf(parentId, overLane, quests);
                const overIdx = sibs.findIndex((s) => s.id === overId);
                let before = null;
                let after = null;
                if (place === 'before') {
                  before = sibs[overIdx - 1] || null;
                  after = sibs[overIdx] || null;
                } else {
                  before = sibs[overIdx] || null;
                  after = sibs[overIdx + 1] || null;
                }

                let newIdx = betweenIndex(before, after);
                if (newIdx == null) {
                  const ids = sibs.map((s) => s.id);
                  const insertAt = place === 'before' ? overIdx : overIdx + 1;
                  const without = ids.filter((id) => id !== activeId);
                  without.splice(insertAt, 0, activeId);
                  await reindexGroup(without);
                  newIdx = (insertAt + 1) * 100;
                }

                await supabase
                  .from('quests')
                  .update({ parent_id: parentId, category: overLane, order_index: newIdx })
                  .eq('id', activeId);
                await reloadQuests();
              } finally {
                endDrag();
              }
            }}
          >
            <LaneSection lane="main" title="Main Quests" items={mainQuests} ids={mainIds} />
            <LaneSection lane="side" title="Side Quests" items={sideQuests} ids={sideIds} />
            <LaneSection lane="inactive" title="Inactive" items={inactiveQuests} ids={inactiveIds} />

            <DragOverlay dropAnimation={null}>
              {activeQuest ? (
                <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 shadow-2xl min-w-[320px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-200/60 text-emerald-900">
                      {String(activeQuest.difficulty || 'easy').replace(/^[a-z]/i, (c) => c.toUpperCase())}
                    </span>
                    <h3 className="text-base font-semibold">{activeQuest.title || 'Quest'}</h3>
                  </div>
                  {activeQuest.extra_info && (
                    <p className="mt-2 text-xs opacity-70">{activeQuest.extra_info}</p>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {actionError && !showForm && (
          <div className="mt-4 max-w-3xl rounded-lg border border-amber-300/40 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
            {actionError}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Quest' : 'Add Quest'}</h3>
                <button
                  onClick={closeForm}
                  className="rounded-md px-2 py-1 text-sm border border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>

              {actionError && (
                <div className="mb-3 rounded-lg border border-rose-300/40 bg-rose-100/50 dark:bg-rose-900/30 px-3 py-2 text-sm text-rose-800 dark:text-rose-200">
                  {actionError}
                </div>
              )}

              <form className="space-y-3" onSubmit={saveForm}>
                <label className="block">
                  <span className="text-sm">Title</span>
                  <TextInput
                    required
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    placeholder="Quest title"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SelectMenu
                    label="Difficulty"
                    value={form.difficulty}
                    onChange={(val) => setField('difficulty', val)}
                    options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]}
                  />
                  <SelectMenu
                    label="Category"
                    value={form.category}
                    onChange={(val) => setField('category', val)}
                    options={[{ value: 'main', label: 'Main' }, { value: 'side', label: 'Side' }, { value: 'inactive', label: 'Inactive' }]}
                  />
                </div>

                <label className="block">
                  <span className="text-sm">Time limit</span>
                  <TextInput
                    type="datetime-local"
                    value={form.timeLimit}
                    onChange={(e) => setField('timeLimit', e.target.value)}
                  />
                </label>

                <TextAreaAuto
                  label="Extra info"
                  value={form.extraInfo}
                  onChange={(e) => setField('extraInfo', e.target.value)}
                  placeholder="Notes, details, acceptance criteria"
                  maxRows={8}
                />

                <label className="block">
                  <span className="text-sm">Parent quest (optional)</span>
                  <select
                    value={form.parentId ?? ''}
                    onChange={(e) => setField('parentId', e.target.value || null)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent"
                  >
                    <option value="">(none)</option>
                    {quests
                      .filter((q) => !q.parent_id)
                      .map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.title}
                        </option>
                      ))}
                  </select>
                </label>

                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={closeForm} className="rounded-lg px-3 py-2 border">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg px-3 py-2 border bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 disabled:opacity-60"
                  >
                    {saving ? 'Saving…' : editingId ? 'Save' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
