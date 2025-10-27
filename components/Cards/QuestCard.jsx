// components/Cards/QuestCard.jsx
"use client";

import React, { useEffect, useState } from "react";
import { TextInput, TextAreaAuto } from '@/components/Form';
import {
  Pencil, Trash2, Calendar,
  ChevronRight, ChevronDown, Plus, X, Check, GripVertical
} from "lucide-react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateQuest, createSubquest } from '@/components/Quests';

export default function QuestCard({
  id,
  dataId,
  title,
  difficulty = "easy",
  timeLimit,
  extraInfo,
  category,
  childrenCount = 0,
  isExpanded,
  onClickBody,
  onDelete,
  onEdit,          // optional legacy modal
  onUpdate,        // (id, payload) => void
  onCreateSub,     // (parentId, payload) => void
  onSaved,         // () => void
  // DnD
  isDragging = false,
  onDragStartCard, // (id) => void
  depth = 0,       // visual nesting depth
}) {
  // inline edit
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title || "");
  const [draftDifficulty, setDraftDifficulty] = useState(difficulty || "easy");
  const [draftTimeLimit, setDraftTimeLimit] = useState(timeLimit ? toLocal(timeLimit) : "");
  const [draftExtra, setDraftExtra] = useState(extraInfo || "");

  // inline subquest composer
  const [addingSub, setAddingSub] = useState(false);
  const [subTitle, setSubTitle] = useState("");
  const [subDiff, setSubDiff] = useState("easy");
  const [subMore, setSubMore] = useState(false);
  const [subTime, setSubTime] = useState("");
  const [subExtra, setSubExtra] = useState("");

  useEffect(() => {
    setDraftTitle(title || "");
    setDraftDifficulty(difficulty || "easy");
    setDraftTimeLimit(timeLimit ? toLocal(timeLimit) : "");
    setDraftExtra(extraInfo || "");
  }, [title, difficulty, timeLimit, extraInfo]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: kitDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const diffBadge = {
    easy:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    hard:   "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  }[difficulty] || "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

  function formattedTime(iso) {
    try { return new Date(iso).toLocaleString(); } catch { return iso || ""; }
  }
  function toLocal(iso) {
    const d = new Date(iso);
    const pad = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
    } catch (e) {
      console.error(e);
    }
  }

  function handleCancel() {
    setEditing(false);
    setDraftTitle(title || "");
    setDraftDifficulty(difficulty || "easy");
    setDraftTimeLimit(timeLimit ? toLocal(timeLimit) : "");
    setDraftExtra(extraInfo || "");
  }

  return (
    <div
      ref={setNodeRef}
      data-quest-id={dataId}
      data-depth={depth}
      style={style}
      className={`relative group rounded-2xl border border-zinc-200 dark:border-zinc-800
                 bg-white/80 dark:bg-zinc-900/60 p-4 pt-5 transition
                 ${isDragging || kitDragging ? "opacity-40 cursor-grabbing" : "hover:shadow-md"}`}
      role="article"
      aria-label={`Quest: ${title}`}
    >
      {/* Toolbar */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
        <button aria-label="Edit quest"
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={(e) => { e.stopPropagation(); setEditing(v => !v); }}>
          <Pencil className="w-4 h-4" />
        </button>
        <button aria-label="Add subquest"
          className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={(e) => { e.stopPropagation(); setAddingSub(true); }}>
          <Plus className="w-4 h-4" />
        </button>
        <button aria-label="Delete quest"
          className="p-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/30"
          onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pr-12">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Drag quest"
            aria-roledescription="sortable"
            className="drag-handle p-1 rounded-md cursor-grab active:cursor-grabbing hover:bg-zinc-100 dark:hover:bg-zinc-800"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-3.5 h-3.5 opacity-60" />
          </button>
          <button
            type="button"
            onClick={() => onClickBody?.(id)}
            className="flex items-center gap-2 text-left focus:outline-none rounded-md"
            title={childrenCount > 0 ? "Expand / collapse" : undefined}
          >
        {childrenCount > 0 ? (
          isExpanded ? <ChevronDown className="w-4 h-4 opacity-70" /> : <ChevronRight className="w-4 h-4 opacity-70" />
        ) : <span className="w-4 h-4" aria-hidden="true" />}

          {!editing ? (
            <>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffBadge}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
              <h3 className="text-base font-semibold">{title}</h3>
            </>
          ) : (
            <>
              <select
                className="ui-select"
                value={draftDifficulty}
                onChange={(e) => setDraftDifficulty(e.target.value)}
                data-no-dnd
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <TextInput
                className="ml-2 text-base font-semibold"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                data-no-dnd
                placeholder="Quest title"
              />
            </>
          )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="mt-2">
        {!editing ? (
          <>
            {timeLimit && (
              <div className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                <Calendar className="w-3 h-3" />
                <time dateTime={timeLimit}>{formattedTime(timeLimit)}</time>
              </div>
            )}
            {extraInfo && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {extraInfo}
              </p>
            )}
          </>
        ) : (
          <>
            <label className="block">
              <span className="text-xs text-zinc-500">Time limit</span>
              <TextInput
                type="datetime-local"
                value={draftTimeLimit}
                onChange={(e) => setDraftTimeLimit(e.target.value)}
                data-no-dnd
              />
            </label>
            <div className="mt-2">
              <TextAreaAuto
                label="Extra info"
                value={draftExtra}
                onChange={(e) => setDraftExtra(e.target.value)}
                data-no-dnd
                placeholder="Notes, details, acceptance criteria…"
                maxRows={6}
              />
            </div>
          </>
        )}
      </div>

      {/* Edit footer */}
      {editing && (
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={handleCancel}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 border">
            <X className="w-4 h-4" /> Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 border bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      )}

      {/* Inline subquest composer */}
      {addingSub && (
        <div className="mt-3 rounded-xl border border-zinc-300 dark:border-zinc-700 p-3">
          <div className="flex items-center gap-2">
            <TextInput
              className="flex-1"
              value={subTitle}
              onChange={(e) => setSubTitle(e.target.value)}
              data-no-dnd
              placeholder="New subquest title"
            />
            <select className="ui-select w-32"
              value={subDiff} onChange={(e)=>setSubDiff(e.target.value)} data-no-dnd>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button type="button"
              className="rounded-lg border px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => setSubMore(v=>!v)}>{subMore ? "Less" : "More"}</button>
          </div>
          {subMore && (
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <label className="block">
                <span className="text-xs text-zinc-500">Time limit</span>
                <TextInput type="datetime-local"
                  value={subTime} onChange={(e)=>setSubTime(e.target.value)} data-no-dnd />
              </label>
              <label className="block md:col-span-2">
                <span className="text-xs text-zinc-500">Extra info</span>
                <TextAreaAuto maxRows={4}
                  value={subExtra} onChange={(e)=>setSubExtra(e.target.value)} data-no-dnd />
              </label>
            </div>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" className="rounded-lg px-3 py-2 border" onClick={()=>{ setAddingSub(false); setSubTitle(""); }}>
              Cancel
            </button>
            <button type="button" className="rounded-lg px-3 py-2 border bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              onClick={async ()=>{
                if (!subTitle.trim()) return;
                try {
                  await createSubquest(
                    { id, category },
                    { title: subTitle, difficulty: subDiff, extraInfo: subExtra, timeLimit: subTime ? new Date(subTime).toISOString() : '' }
                  );
                  setAddingSub(false); setSubTitle(""); setSubMore(false); setSubTime(""); setSubExtra("");
                  onSaved?.();
                } catch (e) { console.error(e); }
              }}>
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
