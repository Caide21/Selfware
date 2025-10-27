// components/Quests/InlineComposer.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { TextInput, TextAreaAuto } from '@/components/Form';
import { createQuest, createSubquest } from '@/components/Quests';

export default function InlineComposer({
  category,        // 'main' | 'side' | 'inactive'
  parentId = null, // UUID or null
  initial = { title: "", difficulty: "easy", timeLimit: "", extraInfo: "" },
  onCreate,        // async (payload) => void
  onCancel,        // () => void
  saving = false,
}) {
  const [openMore, setOpenMore] = useState(false);
  const [title, setTitle] = useState(initial.title || "");
  const [difficulty, setDifficulty] = useState(initial.difficulty || "easy");
  const [timeLimit, setTimeLimit] = useState(initial.timeLimit || "");
  const [extraInfo, setExtraInfo] = useState(initial.extraInfo || "");

  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  async function submit(e) {
    e?.preventDefault?.();
    const payload = {
      title: title.trim(),
      difficulty,
      category,
      timeLimit,   // 'YYYY-MM-DDTHH:mm' or ''
      extraInfo: extraInfo.trim(),
      parentId,
    };
    if (!payload.title) return;
    if (onCreate) {
      await onCreate(payload);
    } else {
      if (parentId) {
        await createSubquest({ id: parentId, category }, payload);
      } else {
        await createQuest(payload);
      }
    }
  }

  return (
    <form onSubmit={submit}
      className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/60 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <TextInput
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={parentId ? "New subquest title" : `New ${category} quest title`}
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-32 rounded-lg border px-2 py-2 bg-transparent"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button
          type="button"
          onClick={() => setOpenMore(v => !v)}
          className="rounded-lg border px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          title={openMore ? "Hide details" : "More fields"}
        >
          {openMore ? "Less" : "More"}
        </button>
      </div>

      {openMore && (
        <div className="grid gap-2 md:grid-cols-2">
          <label className="block">
            <span className="text-sm">Time limit</span>
            <input
              type="datetime-local"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-transparent"
            />
          </label>
          <div className="md:col-span-2">
            <TextAreaAuto
              label="Extra info"
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              placeholder="Notes, details, acceptance criteria…"
              maxRows={8}
            />
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-lg px-3 py-2 border">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="rounded-lg px-3 py-2 border bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 disabled:opacity-60">
          {saving ? "Saving…" : "Create"}
        </button>
      </div>
    </form>
  );
}
