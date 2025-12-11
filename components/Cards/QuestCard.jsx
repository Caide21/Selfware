'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/CardKit/Card';
import CardEditor from './CardEditor';

function normalizeEdited(quest = {}) {
  return {
    title: quest.title ?? '',
    description: quest.description ?? quest.extra_info ?? '',
    status: quest.status ?? 'backlog',
    xpValue: quest.xpValue ?? quest.xp_value ?? 0,
    projectName: quest.projectName ?? quest.project_name ?? null,
  };
}

export default function QuestCard({ quest, isNew: isNewProp = false, onSaved, onDiscard }) {
  const initial = quest || {};
  const [mode, setMode] = useState(isNewProp ? 'edit' : 'view');
  const [isNew, setIsNew] = useState(Boolean(isNewProp));
  const [edited, setEdited] = useState(() => normalizeEdited(initial));
  const [lastSaved, setLastSaved] = useState(() => normalizeEdited(initial));

  useEffect(() => {
    const normalized = normalizeEdited(quest || {});
    setEdited(normalized);
    setLastSaved(normalized);
    setIsNew(Boolean(isNewProp));
    if (isNewProp) setMode('edit');
  }, [quest, isNewProp]);

  const statusLabel = String(edited.status || 'backlog')
    .replace(/_/g, ' ')
    .toUpperCase();

  function handleCardClick(e) {
    if (e.shiftKey && mode === 'view') {
      e.preventDefault();
      e.stopPropagation();
      setMode('edit');
    }
  }

  async function handleSaveClick() {
    if (!isNew) {
      const ok = window.confirm('Are you sure you want to apply these changes?');
      if (!ok) return;
    }

    const xpVal = edited.xpValue === '' ? 0 : Number(edited.xpValue ?? 0);
    const payload = {
      title: edited.title,
      status: edited.status,
      xp_value: Number.isFinite(xpVal) ? xpVal : 0,
      extra_info: edited.description ?? '',
    };

    if (onSaved) {
      await onSaved(payload, { isNew, id: initial.id });
    }

    setLastSaved(normalizeEdited({ ...initial, ...payload }));
    setIsNew(false);
    setMode('view');
  }

  function handleCancelClick() {
    if (isNew) {
      onDiscard?.();
      return;
    }
    setEdited(lastSaved);
    setMode('view');
  }

  const isEditing = mode === 'edit';

  return (
    <Card
      variant="warning"
      accent="#fbbf24"
      title={edited.title || 'Untitled quest'}
      meta={statusLabel}
      interactive
      selected={isEditing}
      onClick={handleCardClick}
      footer={
        isEditing ? (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              onClick={handleCancelClick}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600"
              onClick={handleSaveClick}
            >
              Save
            </button>
          </div>
        ) : null
      }
    >
      <div className="mt-1 flex items-center justify-between gap-3 text-sm text-text/70">
        <div className="font-semibold text-amber-700">XP {edited.xpValue ?? 0}</div>
        {edited.projectName ? <div className="text-xs text-text/60">Project: {edited.projectName}</div> : null}
      </div>

      {!isEditing && edited.description ? (
        <p className="text-sm text-text/80">{edited.description}</p>
      ) : null}

      {isEditing && <CardEditor type="quest" value={edited} onChange={setEdited} />}
    </Card>
  );
}
