'use client';

import React from 'react';
import { CARD_SCHEMAS } from '@/modules/cards/cardSchemas';

export default function CardEditor({ type, value, onChange }) {
  const schema = CARD_SCHEMAS[type];
  if (!schema) return null;

  function updateField(key, newValue) {
    onChange({
      ...value,
      [key]: newValue,
    });
  }

  return (
    <div className="mt-3 space-y-3">
      {Object.entries(schema).map(([key, field]) => {
        const v = value[key];

        if (field.widget === 'text') {
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-slate-500">{field.label}</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                type="text"
                value={v ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          );
        }

        if (field.widget === 'textarea') {
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-slate-500">{field.label}</label>
              <textarea
                className="w-full min-h-[72px] rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                value={v ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          );
        }

        if (field.widget === 'number') {
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-slate-500">{field.label}</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                type="number"
                min={field.min}
                value={v ?? 0}
                onChange={(e) => updateField(key, e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          );
        }

        if (field.widget === 'select') {
          return (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-slate-500">{field.label}</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none ring-0 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
                value={v ?? field.options?.[0] ?? ''}
                onChange={(e) => updateField(key, e.target.value)}
              >
                {(field.options || []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
