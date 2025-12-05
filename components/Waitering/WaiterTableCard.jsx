import React from 'react';
import Card from '@/components/CardKit/Card';
import Chip from '@/components/ui/Chip';

/**
 * @typedef {Object} WaiterTable
 * @property {string} id
 * @property {string} user_id
 * @property {string} shift_id
 * @property {string} table_number
 * @property {number} guests
 * @property {number} bill_total
 * @property {number} tip_amount
 * @property {string} payment_method
 * @property {string|null} screenshot_url
 * @property {string|null} notes
 * @property {string} created_at
 */

function formatCurrency(amount) {
  const num = Number(amount ?? 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  return `R ${num.toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function WaiterTableCard({ table, onEdit, onDelete }) {
  const tipPct =
    table.bill_total > 0 ? ((Number(table.tip_amount || 0) / Number(table.bill_total)) * 100).toFixed(1) : null;

  const paymentLabel =
    table.payment_method === 'cash'
      ? 'Cash'
      : table.payment_method === 'mixed'
      ? 'Mixed'
      : 'Card';

  return (
    <Card
      title={`Table ${table.table_number}`}
      subtitle={`${table.guests ?? 0} guest${(table.guests || 0) === 1 ? '' : 's'}`}
      meta={<Chip className="bg-white/70 px-2 py-0.5 text-[11px]">{paymentLabel}</Chip>}
      variant="neutral"
      compact={false}
    >
      <div className="space-y-2 text-sm text-text/90">
        <div className="flex items-center justify-between">
          <span className="font-medium text-text">Bill</span>
          <span className="font-semibold">{formatCurrency(table.bill_total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-text">Tip</span>
          <span className="font-semibold">
            {formatCurrency(table.tip_amount)}
            {tipPct ? <span className="ml-2 text-xs text-text/70">({tipPct}%)</span> : null}
          </span>
        </div>

        {table.notes ? <p className="text-sm text-text/80 whitespace-pre-line">{table.notes}</p> : null}

        {table?.screenshot_url ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-text/70">
              <span className="font-medium uppercase tracking-wide">Bill screenshot</span>
              <a
                href={table.screenshot_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium hover:underline"
              >
                Open full
              </a>
            </div>
            <a
              href={table.screenshot_url}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-lg border border-white/30 bg-white/30 shadow-inner"
            >
              <img
                src={table.screenshot_url}
                alt="Bill screenshot"
                className="h-32 w-full object-cover transition-transform duration-150 hover:scale-[1.02] cursor-zoom-in"
                loading="lazy"
              />
            </a>
          </div>
        ) : null}
      </div>

      <footer className="mt-3 flex items-center justify-between text-[11px] uppercase tracking-wide text-text/60">
        <span>Added {formatDateTime(table.created_at)}</span>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-text hover:bg-slate-50"
            onClick={() => onEdit?.(table)}
          >
            Edit
          </button>
          <button
            type="button"
            className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
            onClick={() => onDelete?.(table)}
          >
            Delete
          </button>
        </div>
      </footer>
    </Card>
  );
}
