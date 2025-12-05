'use client';

import React, { useEffect, useState } from 'react';
import { baseCardClasses, hoverClasses, cardAccents } from './cardChrome';
import CardEditor from './CardEditor';

const questAccent = cardAccents.quest || 'border-amber-300/70';

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
    <div
      className={`${baseCardClasses} ${questAccent} ${hoverClasses} ${
        isEditing ? 'ring-2 ring-amber-300/80' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm sm:text-base font-semibold text-slate-900">
          {edited.title || 'Untitled quest'}
        </div>

        <span className="inline-flex items-center rounded-full border border-amber-300/80 bg-amber-50/70 px-2 py-0.5 text-[11px] uppercase tracking-wide text-amber-700">
          {statusLabel}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-between gap-3 text-sm text-slate-600">
        <div className="font-semibold text-amber-700">XP {edited.xpValue ?? 0}</div>
        {edited.projectName ? <div className="text-xs text-slate-500">Project: {edited.projectName}</div> : null}
      </div>

      {!isEditing && edited.description ? (
        <p className="text-sm text-slate-700">{edited.description}</p>
      ) : null}

      {isEditing && (
        <>
          <CardEditor type="quest" value={edited} onChange={setEdited} />
          <div className="mt-4 flex justify-end gap-2">
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
        </>
      )}
    </div>
  );
}
