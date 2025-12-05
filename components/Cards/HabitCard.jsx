'use client';

import React, { useEffect, useState } from 'react';
import { baseCardClasses, hoverClasses, cardAccents } from './cardChrome';
import CardEditor from './CardEditor';

const habitAccent = cardAccents.habit || 'border-cyan-300/70';

function normalizeEdited(habit = {}) {
  return {
    title: habit.title ?? '',
    description: habit.description ?? '',
    cadence: habit.cadence ?? '',
    streak: habit.streak ?? habit.streakCount ?? 0,
    status: habit.status ?? habit.todayStatus ?? 'active',
    xpValue: habit.xp_value ?? habit.xpValue ?? habit.xp ?? 0,
  };
}

export default function HabitCard({ habit: habitProp, card, isNew: isNewProp = false, onSaved, onDiscard }) {
  const initial = habitProp || card || {};
  const [mode, setMode] = useState(isNewProp ? 'edit' : 'view');
  const [isNew, setIsNew] = useState(Boolean(isNewProp));
  const [edited, setEdited] = useState(() => normalizeEdited(initial));
  const [lastSaved, setLastSaved] = useState(() => normalizeEdited(initial));

  useEffect(() => {
    const normalized = normalizeEdited(habitProp || card || {});
    setEdited(normalized);
    setLastSaved(normalized);
    setIsNew(Boolean(isNewProp));
    if (isNewProp) setMode('edit');
  }, [habitProp, card, isNewProp]);

  const statusLabel = String(edited.status || 'active')
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
      const ok = window.confirm('Apply habit changes?');
      if (!ok) return;
    }

    const xpVal = edited.xpValue === '' ? 0 : Number(edited.xpValue ?? 0);
    const payload = {
      title: edited.title,
      description: edited.description ?? '',
      cadence: edited.cadence ?? '',
      streak: edited.streak ?? 0,
      status: edited.status,
      xp_value: Number.isFinite(xpVal) ? xpVal : 0,
    };

    await onSaved?.(payload, { isNew, id: initial.id });

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
      className={`${baseCardClasses} ${habitAccent} ${hoverClasses} ${
        isEditing ? 'ring-2 ring-cyan-300/70' : ''
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm sm:text-base font-semibold text-slate-900">
          {edited.title || 'Untitled habit'}
        </div>

        <span className="inline-flex items-center rounded-full border border-cyan-300/80 bg-cyan-50/70 px-2 py-0.5 text-[11px] uppercase tracking-wide text-cyan-700">
          {statusLabel}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <div className="font-semibold text-cyan-700">XP {edited.xpValue ?? 0}</div>
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Streak: <span className="font-semibold text-slate-700">{edited.streak ?? 0}</span>
        </div>
        {edited.cadence ? <div className="text-xs text-slate-500">Cadence: {edited.cadence}</div> : null}
      </div>

      {!isEditing && edited.description ? (
        <p className="text-sm text-slate-700">{edited.description}</p>
      ) : null}

      {isEditing && (
        <>
          <CardEditor type="habit" value={edited} onChange={setEdited} />
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