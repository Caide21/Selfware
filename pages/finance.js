import { useMemo, useState } from 'react';
import Head from 'next/head';
import Card from '@/components/CardKit/Card';
import { TextAreaAuto, TextInput } from '@/components/Form';
import { usePageHeading } from '@/components/Layout/PageShell';

const PAGE_HEADING = {
  emoji: '',
  title: 'Finance OS',
  subtitle: 'Track visible money movement from cashups, retained cash, income, and expenses.',
};

const PEOPLE = ['Caide', 'Justin'];
const FILTERS = ['Combined', 'Caide', 'Justin'];

const initialIncomeForm = {
  date: '',
  person: 'Caide',
  source: '',
  amount: '',
  cashRetained: '',
  notes: '',
};

const initialExpenseForm = {
  date: '',
  person: 'Caide',
  category: '',
  amount: '',
  paymentMethod: 'cash',
  notes: '',
};

const starterEntries = [
  {
    id: 'sample-income-1',
    type: 'income',
    date: '2026-04-29',
    person: 'Caide',
    label: 'Bossa cashup',
    amount: 860,
    cashRetained: 320,
    notes: 'Sample local entry. Replace once backend storage is ready.',
  },
  {
    id: 'sample-expense-1',
    type: 'expense',
    date: '2026-04-29',
    person: 'Justin',
    label: 'Groceries',
    amount: 240,
    paymentMethod: 'card',
    notes: 'Sample shared expense.',
  },
];

function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  return `R ${num.toFixed(2)}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function moneyValue(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function SummaryTile({ label, value, hint }) {
  return (
    <div className="h-full rounded-lg border border-white/20 bg-white/55 px-4 py-3 text-left shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-text/55">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-text">{value}</div>
      {hint ? <div className="mt-1 text-xs text-text/60">{hint}</div> : null}
    </div>
  );
}

function FilterButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-1.5 text-sm font-semibold transition',
        active
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-white text-text/70 hover:bg-slate-50',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function FinancePage() {
  const [filter, setFilter] = useState('Combined');
  const [entries, setEntries] = useState(starterEntries);
  const [incomeForm, setIncomeForm] = useState(initialIncomeForm);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);

  usePageHeading(PAGE_HEADING);

  const visibleEntries = useMemo(
    () => entries.filter((entry) => filter === 'Combined' || entry.person === filter),
    [entries, filter]
  );

  const summary = useMemo(() => {
    const today = todayKey();
    const todayEntries = visibleEntries.filter((entry) => entry.date === today);
    const todayEarned = todayEntries
      .filter((entry) => entry.type === 'income')
      .reduce((total, entry) => total + moneyValue(entry.amount), 0);
    const todaySpent = todayEntries
      .filter((entry) => entry.type === 'expense')
      .reduce((total, entry) => total + moneyValue(entry.amount), 0);
    const netCash = visibleEntries.reduce((total, entry) => {
      if (entry.type === 'income') return total + moneyValue(entry.cashRetained || entry.amount);
      return total - moneyValue(entry.amount);
    }, 0);
    const monthProjected = visibleEntries.reduce((total, entry) => {
      if (entry.type === 'income') return total + moneyValue(entry.amount);
      return total - moneyValue(entry.amount);
    }, 0);

    return { todayEarned, todaySpent, netCash, monthProjected };
  }, [visibleEntries]);

  function handleAddIncome(e) {
    e.preventDefault();
    const amount = moneyValue(incomeForm.amount);
    const cashRetained = moneyValue(incomeForm.cashRetained);
    if (!incomeForm.date || !incomeForm.source || amount <= 0) return;

    setEntries((prev) => [
      {
        id: `income-${Date.now()}`,
        type: 'income',
        date: incomeForm.date,
        person: incomeForm.person,
        label: incomeForm.source,
        amount,
        cashRetained,
        notes: incomeForm.notes,
      },
      ...prev,
    ]);
    setIncomeForm(initialIncomeForm);
  }

  function handleAddExpense(e) {
    e.preventDefault();
    const amount = moneyValue(expenseForm.amount);
    if (!expenseForm.date || !expenseForm.category || amount <= 0) return;

    setEntries((prev) => [
      {
        id: `expense-${Date.now()}`,
        type: 'expense',
        date: expenseForm.date,
        person: expenseForm.person,
        label: expenseForm.category,
        amount,
        paymentMethod: expenseForm.paymentMethod,
        notes: expenseForm.notes,
      },
      ...prev,
    ]);
    setExpenseForm(initialExpenseForm);
  }

  return (
    <>
      <Head>
        <title>Finance OS</title>
      </Head>

      <section className="mx-auto max-w-6xl space-y-6">
        <Card
          title="Today's Cash Position"
          subtitle="Frontend skeleton with local entries only"
          variant="neutral"
          accent="#34d399"
          className="text-left"
          rightSlot={
            <div className="flex flex-wrap justify-end gap-2">
              {FILTERS.map((item) => (
                <FilterButton key={item} active={filter === item} onClick={() => setFilter(item)}>
                  {item}
                </FilterButton>
              ))}
            </div>
          }
        >
          <div className="grid gap-3 md:grid-cols-4">
            <SummaryTile label="Today earned" value={formatCurrency(summary.todayEarned)} />
            <SummaryTile label="Today spent" value={formatCurrency(summary.todaySpent)} />
            <SummaryTile label="Net cash" value={formatCurrency(summary.netCash)} hint="Retained cash minus expenses" />
            <SummaryTile label="Month projected" value={formatCurrency(summary.monthProjected)} hint="Local estimate" />
          </div>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Add Income" subtitle="Cashups, retained cash, sales, transfers" variant="neutral" compact={false}>
            <form className="space-y-4" onSubmit={handleAddIncome}>
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput
                  required
                  type="date"
                  label="Date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                <label className="block space-y-1">
                  <span className="block text-sm font-medium text-text">Person</span>
                  <select
                    className="min-h-[40px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={incomeForm.person}
                    onChange={(e) => setIncomeForm((prev) => ({ ...prev, person: e.target.value }))}
                  >
                    {PEOPLE.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </label>
                <TextInput
                  required
                  label="Source"
                  placeholder="Bossa cashup, transfer, side job"
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm((prev) => ({ ...prev, source: e.target.value }))}
                />
                <TextInput
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  label="Amount (R)"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
                <TextInput
                  type="number"
                  min="0"
                  step="0.01"
                  label="Cash retained (R)"
                  value={incomeForm.cashRetained}
                  onChange={(e) => setIncomeForm((prev) => ({ ...prev, cashRetained: e.target.value }))}
                  hint="Use this when cash kept differs from total income."
                />
              </div>
              <TextAreaAuto
                label="Notes"
                maxRows={4}
                placeholder="Optional detail. Deeper context belongs in Notes."
                value={incomeForm.notes}
                onChange={(e) => setIncomeForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
              <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110">
                Add income
              </button>
            </form>
          </Card>

          <Card title="Add Expense" subtitle="Visible money leaving the system" variant="neutral" compact={false}>
            <form className="space-y-4" onSubmit={handleAddExpense}>
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput
                  required
                  type="date"
                  label="Date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, date: e.target.value }))}
                />
                <label className="block space-y-1">
                  <span className="block text-sm font-medium text-text">Person</span>
                  <select
                    className="min-h-[40px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={expenseForm.person}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, person: e.target.value }))}
                  >
                    {PEOPLE.map((person) => (
                      <option key={person} value={person}>
                        {person}
                      </option>
                    ))}
                  </select>
                </label>
                <TextInput
                  required
                  label="Category"
                  placeholder="Food, transport, supplies"
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))}
                />
                <TextInput
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  label="Amount (R)"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
                <label className="block space-y-1">
                  <span className="block text-sm font-medium text-text">Payment method</span>
                  <select
                    className="min-h-[40px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-text transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="eft">EFT</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </div>
              <TextAreaAuto
                label="Notes"
                maxRows={4}
                placeholder="Optional detail. Keep the money movement visible."
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
              <button className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110">
                Add expense
              </button>
            </form>
          </Card>
        </div>

        <Card title="Recent Entries" subtitle={`${filter} view`} variant="neutral" accent="#60a5fa" compact={false}>
          <div className="space-y-3">
            {visibleEntries.map((entry) => (
              <div
                key={entry.id}
                className="grid gap-3 rounded-lg border border-slate-200 bg-white/70 p-3 text-sm md:grid-cols-[1fr_auto]"
              >
                <div>
                  <div className="font-semibold text-text">
                    {entry.label} <span className="text-text/50">- {entry.person}</span>
                  </div>
                  <div className="mt-1 text-xs text-text/60">
                    {entry.date} / {entry.type === 'income' ? 'Income' : 'Expense'}
                    {entry.paymentMethod ? ` / ${entry.paymentMethod}` : ''}
                    {entry.cashRetained ? ` / retained ${formatCurrency(entry.cashRetained)}` : ''}
                  </div>
                  {entry.notes ? <div className="mt-2 text-xs text-text/70">{entry.notes}</div> : null}
                </div>
                <div
                  className={[
                    'text-right text-base font-semibold',
                    entry.type === 'income' ? 'text-emerald-700' : 'text-rose-700',
                  ].join(' ')}
                >
                  {entry.type === 'income' ? '+' : '-'}
                  {formatCurrency(entry.amount)}
                </div>
              </div>
            ))}
            {!visibleEntries.length ? (
              <div className="rounded-lg border border-slate-200 bg-white/60 p-4 text-sm text-text/70">
                No entries in this filter yet.
              </div>
            ) : null}
          </div>
        </Card>
      </section>
    </>
  );
}
