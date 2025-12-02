// modules/quests/QuestCard.jsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput, TextAreaAuto } from '@/components/Form';
import { Pencil, Trash2, Calendar, ChevronRight, ChevronDown, Plus, X, Check, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateQuest, createSubquest } from '@/components/Quests';
import Card from '@/components/CardKit/Card';
import { useEditorEscape } from '@/modules/cards/useEditorKeys';

export default function QuestCard({
  id,
  dataId,
  title,
  difficulty = 'easy',
  timeLimit,
  extraInfo,
  category,
  childrenCount = 0,
  isExpanded,
  onClickBody,
  onDelete,
  onEdit,
  onUpdate,
  onCreateSub,
  onSaved,
  isDragging = false,
  onDragStartCard,
  depth = 0,
  canEdit = true,
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title || '');
  const [draftDifficulty, setDraftDifficulty] = useState(difficulty || 'easy');
  const [draftTimeLimit, setDraftTimeLimit] = useState(timeLimit ? toLocal(timeLimit) : '');
  const [draftExtra, setDraftExtra] = useState(extraInfo || '');

  const [addingSub, setAddingSub] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [subDiff, setSubDiff] = useState('easy');
  const [subMore, setSubMore] = useState(false);
  const [subTime, setSubTime] = useState('');
  const [subExtra, setSubExtra] = useState('');
  const cardRef = useRef(null);

  useEffect(() => {
    setDraftTitle(title || '');
    setDraftDifficulty(difficulty || 'easy');
    setDraftTimeLimit(timeLimit ? toLocal(timeLimit) : '');
    setDraftExtra(extraInfo || '');
  }, [title, difficulty, timeLimit, extraInfo]);

  useEffect(() => {
    if (!canEdit) {
      setEditing(false);
      setAddingSub(false);
    }
  }, [canEdit]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: kitDragging } = useSortable({
    id,
    disabled: !canEdit,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const variant =
    {
      main: 'info',
      inactive: 'warning',
      busy: 'busy',
    }[category] ?? 'neutral';

  const diffBadge =
    {
      easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    }[difficulty] || 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';

  function formattedTime(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso || '';
    }
  }

  function toLocal(iso) {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleSave() {
    try {
      const payload = {
        title: draftTitle.trim(),
        difficulty: draftDifficulty,
        extraInfo: draftExtra?.trim() || null,
      };
      await updateQuest(id, payload);
      setEditing(false);
      onSaved?.();
    } catch (error) {
      console.error(error);
    }
  }

  const resetSubComposer = useCallback(() => {
    setAddingSub(false);
    setSubTitle('');
    setSubDiff('easy');
    setSubMore(false);
    setSubTime('');
    setSubExtra('');
  }, []);

  function handleCancel() {
    setEditing(false);
    setDraftTitle(title || '');
    setDraftDifficulty(difficulty || 'easy');
    setDraftTimeLimit(timeLimit ? toLocal(timeLimit) : '');
    setDraftExtra(extraInfo || '');
  }

  useEditorEscape({
    onExit: () => {
      if (editing) {
        handleCancel();
      } else if (addingSub) {
        resetSubComposer();
      }
    },
    ref: cardRef,
  });

  const dragging = isDragging || kitDragging;
  const cardClassName = ['group transition', dragging ? 'opacity-40 cursor-grabbing' : '']
    .filter(Boolean)
    .join(' ');
  const dragAttributes = canEdit ? attributes : {};
  const dragListeners = canEdit ? listeners : {};
  const dragButtonClass = canEdit
    ? 'drag-handle cursor-grab rounded-md p-1 hover:bg-zinc-100 active:cursor-grabbing dark:hover:bg-zinc-800'
    : 'drag-handle cursor-default rounded-md p-1 opacity-50';
  const composedRef = useCallback(
    (node) => {
      setNodeRef(node);
      cardRef.current = node;
    },
    [setNodeRef]
  );

  const mediaContent = (
    <div className="relative space-y-3">
      {canEdit ? (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            aria-label="Edit quest"
            className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={(event) => {
              event.stopPropagation();
              if (onEdit) onEdit(id);
              else setEditing((value) => !value);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            aria-label="Add subquest"
            className="rounded-md p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={(event) => {
              event.stopPropagation();
              if (onCreateSub) onCreateSub(id, { parentId: id });
              else setAddingSub(true);
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            aria-label="Delete quest"
            className="rounded-md p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-2 pr-12">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Drag quest"
            aria-roledescription="sortable"
            className={dragButtonClass}
            disabled={!canEdit}
            {...dragAttributes}
            {...dragListeners}
          >
            <GripVertical className="h-3.5 w-3.5 opacity-60" />
          </button>
          <button
            type="button"
            onClick={() => onClickBody?.(id)}
            className="flex items-center gap-2 rounded-md text-left focus:outline-none"
            title={childrenCount > 0 ? 'Expand / collapse' : undefined}
          >
            {childrenCount > 0 ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4 opacity-70" />
              ) : (
                <ChevronRight className="h-4 w-4 opacity-70" />
              )
            ) : (
              <span className="h-4 w-4" aria-hidden="true" />
            )}

            {!editing ? (
              <>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffBadge}`}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>
                <h3 className="text-base font-semibold">{title}</h3>
              </>
            ) : (
              <>
                <select
                  className="ui-select"
                  value={draftDifficulty}
                  onChange={(event) => setDraftDifficulty(event.target.value)}
                  data-no-dnd
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <TextInput
                  className="ml-2 text-base font-semibold"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  data-no-dnd
                  placeholder="Quest title"
                />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-2">
        {!editing ? (
          <>
            {timeLimit && (
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="h-3 w-3" />
                <time dateTime={timeLimit}>{formattedTime(timeLimit)}</time>
              </div>
            )}
            {extraInfo && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{extraInfo}</p>}
          </>
        ) : (
          <>
            <label className="block">
              <span className="text-xs text-zinc-500">Time limit</span>
              <TextInput
                type="datetime-local"
                value={draftTimeLimit}
                onChange={(event) => setDraftTimeLimit(event.target.value)}
                data-no-dnd
              />
            </label>
            <div className="mt-2">
              <TextAreaAuto
                label="Extra info"
                value={draftExtra}
                onChange={(event) => setDraftExtra(event.target.value)}
                data-no-dnd
                placeholder="Notes, details, acceptance criteria..."
                maxRows={6}
              />
            </div>
          </>
        )}
      </div>

      {editing && (
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={handleCancel} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2">
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
          >
            <Check className="h-4 w-4" /> Save
          </button>
        </div>
      )}

      {addingSub && (
        <div className="mt-3 rounded-xl border border-zinc-300 p-3 dark:border-zinc-700">
          <div className="flex items-center gap-2">
            <TextInput
              className="flex-1"
              value={subTitle}
              onChange={(event) => setSubTitle(event.target.value)}
              data-no-dnd
              placeholder="New subquest title"
            />
            <select className="ui-select w-32" value={subDiff} onChange={(event) => setSubDiff(event.target.value)} data-no-dnd>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              type="button"
              className="rounded-lg border px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setSubMore((value) => !value)}
            >
              {subMore ? 'Less' : 'More'}
            </button>
          </div>
          {subMore && (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-xs text-zinc-500">Time limit</span>
                <TextInput type="datetime-local" value={subTime} onChange={(event) => setSubTime(event.target.value)} data-no-dnd />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs text-zinc-500">Extra info</span>
                <TextAreaAuto maxRows={4} value={subExtra} onChange={(event) => setSubExtra(event.target.value)} data-no-dnd />
              </label>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="rounded-lg border px-3 py-2" onClick={resetSubComposer}>
              Cancel
            </button>
            <button
              type="button"
              className="rounded-lg border px-3 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              onClick={async () => {
                if (!subTitle.trim()) return;
                try {
                  await createSubquest(
                    { id, category },
                    {
                      title: subTitle,
                      difficulty: subDiff,
                      extraInfo: subExtra,
                      timeLimit: subTime ? new Date(subTime).toISOString() : '',
                    }
                  );
                  resetSubComposer();
                  onSaved?.();
                } catch (error) {
                  console.error(error);
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card
      ref={composedRef}
      variant={variant}
      interactive={false}
      className={cardClassName}
      style={style}
      data-quest-id={dataId}
      data-depth={depth}
      role="article"
      aria-label={`Quest: ${title}`}
      onPointerDownCapture={() => {
        if (canEdit) onDragStartCard?.(id);
      }}
      media={mediaContent}
    />
  );
}









