// pages/quests/index.js
import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import QuestCard from '@/components/Cards/QuestCard';
import { usePageHeading } from '../../components/Layout/PageShell';
import { fetchQuests as apiFetchQuests, createQuest, updateQuest } from '@/components/Quests';

const PAGE_HEADING = {
  emoji: '',
  title: 'Quests',
  subtitle: 'Track your goals and progress with structured quests',
};

function mapQuestRowToCard(quest) {
  return {
    id: quest.id,
    title: quest.title ?? '',
    status: quest.status ?? 'pending',
    xpValue: quest.xp_value ?? 0,
    projectName: quest.project_name ?? null,
    description: quest.extra_info ?? quest.description ?? '',
  };
}

function createBlankQuestForLane(lane = 'side') {
  const tempId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(16).slice(2);
  return {
    id: `temp-${tempId}`,
    title: '',
    status: 'backlog',
    xp_value: 0,
    extra_info: '',
    category: lane,
    parent_id: null,
    isNew: true,
  };
}

export default function QuestsPage() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [actionError, setActionError] = useState(null);

  usePageHeading(PAGE_HEADING);

  function handleAddQuest(lane = 'side') {
    setQuests((prev) => [...prev, createBlankQuestForLane(lane)]);
  }

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
    return () => {
      active = false;
    };
  }, []);

  async function reloadQuests() {
    const data = await apiFetchQuests();
    setQuests(data);
  }

  function indentClass(depth) {
    if (depth <= 0) return '';
    if (depth === 1) return 'ml-6';
    if (depth === 2) return 'ml-12';
    if (depth === 3) return 'ml-16';
    return 'ml-20';
  }

  function renderSubtree(parentId, depth = 1) {
    const kids = (childrenMap.get(parentId) || [])
      .map((id) => quests.find((q) => q.id === id))
      .filter(Boolean);

    if (kids.length === 0) return null;

    return (
      <div className="flex flex-col gap-3">
        {kids.map((child) => (
          <div key={child.id}>
            <div className={indentClass(depth)}>
              <QuestCard
                quest={mapQuestRowToCard(child)}
                isNew={child.isNew}
                onSaved={async (payload, { isNew }) => {
                  try {
                    if (isNew) {
                      await createQuest({
                        title: payload.title,
                        status: payload.status,
                        xp_value: payload.xp_value,
                        extraInfo: payload.extra_info,
                        category: child.category || 'side',
                      });
                    } else {
                      await updateQuest(child.id, payload);
                    }
                    await reloadQuests();
                  } catch (error) {
                    setActionError(error.message || 'Save failed');
                  }
                }}
                onDiscard={() => {
                  if (child.isNew) {
                    setQuests((prev) => prev.filter((q) => q.id !== child.id));
                  }
                }}
              />
            </div>
            {renderSubtree(child.id, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  function LaneSection({ title, items, lane }) {
    return (
      <section className="mb-10">
        <div className="mb-2 text-sm font-semibold text-zinc-400 uppercase tracking-wider">{title}</div>
        <div className="rounded-xl border border-zinc-200/60 p-3">
          <div className="flex flex-col gap-3">
            {items.map((q) => (
              <div key={q.id}>
                <QuestCard
                  quest={mapQuestRowToCard(q)}
                  isNew={q.isNew}
                  onSaved={async (payload, { isNew }) => {
                    try {
                      if (isNew) {
                        await createQuest({
                          title: payload.title,
                          status: payload.status,
                          xp_value: payload.xp_value,
                          extraInfo: payload.extra_info,
                          category: lane,
                        });
                      } else {
                        await updateQuest(q.id, payload);
                      }
                      await reloadQuests();
                    } catch (error) {
                      setActionError(error.message || 'Save failed');
                    }
                  }}
                  onDiscard={() => {
                    if (q.isNew) {
                      setQuests((prev) => prev.filter((qq) => qq.id !== q.id));
                    }
                  }}
                />
                {renderSubtree(q.id, 1)}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const mainQuests = useMemo(() => quests.filter((q) => q.category === 'main' && !q.parent_id), [quests]);
  const sideQuests = useMemo(() => quests.filter((q) => q.category === 'side' && !q.parent_id), [quests]);
  const inactiveQuests = useMemo(() => quests.filter((q) => q.category === 'inactive' && !q.parent_id), [quests]);

  return (
    <>
      <Head>
        <title>Quests</title>
      </Head>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => handleAddQuest('side')}
            className="rounded-xl px-3 py-2 border border-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Add Quest
          </button>
        </div>

        {loading && <div className="text-sm text-zinc-500">Loading quests.</div>}
        {loadError && <div className="text-sm text-rose-600">Error: {loadError}</div>}

        {!loading && !loadError && (
          <>
            <LaneSection title="Main Quests" items={mainQuests} lane="main" />
            <LaneSection title="Side Quests" items={sideQuests} lane="side" />
            <LaneSection title="Inactive" items={inactiveQuests} lane="inactive" />
          </>
        )}

        {actionError && (
          <div className="mt-4 max-w-3xl rounded-lg border border-amber-300/40 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
            {actionError}
          </div>
        )}
      </div>
    </>
  );
}
