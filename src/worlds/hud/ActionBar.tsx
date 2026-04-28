'use client';

import React from 'react';

const ActionBar: React.FC = () => {
  return (
    <div className="border-t border-slate-200 bg-slate-950/80 px-4 py-2 text-xs text-slate-100 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
        <span className="text-[0.7rem] uppercase tracking-wide text-slate-400">
          Action Bar · WIP
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-600/70 bg-slate-900 px-3 py-1 text-[0.7rem] font-medium text-slate-100 hover:bg-slate-800"
          >
            Start Focus
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-600/70 bg-slate-900 px-3 py-1 text-[0.7rem] font-medium text-slate-100 hover:bg-slate-800"
          >
            New Quest
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
