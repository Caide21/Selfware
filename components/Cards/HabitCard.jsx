'use client';

import React, { useEffect, useState } from 'react';
import Card from '@/components/CardKit/Card';
import CardEditor from './CardEditor';

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
    <Card
      variant="success"
      accent="#22d3ee"
      title={edited.title || 'Untitled habit'}
      meta={statusLabel}
      interactive
      selected={isEditing}
      onClick={handleCardClick}
    >
      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-text/80">
        <div className="font-semibold text-emerald-700">XP {edited.xpValue ?? 0}</div>
        <div className="text-xs uppercase tracking-wide text-text/60">
          Streak: <span className="font-semibold text-text">{edited.streak ?? 0}</span>
        </div>
        {edited.cadence ? <div className="text-xs text-text/60">Cadence: {edited.cadence}</div> : null}
      </div>

      {!isEditing && edited.description ? (
        <p className="text-sm text-text/80">{edited.description}</p>
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
    </Card>
  );
}
