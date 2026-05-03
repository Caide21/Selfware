import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '@/components/CardKit/Card';
import { usePageHeading } from '@/components/Layout/PageShell';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'My Finance OS',
  subtitle: 'Private income, expenses, loans, repayments, and cash-up cashHome from your Notes commands.',
};

const MOVE_OUT_TARGET = 55000;
const MONTHLY_COST_TARGET = 24550;
const INCOME_TARGET = 28000;

function amountValue(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  if (num < 0) return `-R ${Math.abs(num).toFixed(2)}`;
  return `R ${num.toFixed(2)}`;
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function monthKey(value) {
  if (!value) return '';
  return String(value).slice(0, 7);
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function ProgressBar({ value, tone = 'emerald' }) {
  const width = `${clampPercent(value)}%`;
  const color = tone === 'rose' ? 'bg-rose-500' : tone === 'amber' ? 'bg-amber-400' : 'bg-emerald-400';

  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/45">
      <div className={`h-full rounded-full ${color}`} style={{ width }} />
    </div>
  );
}

function SummaryTile({ label, value, hint, accent = 'text-text' }) {
  return (
    <div className="h-full rounded-lg border border-white/20 bg-white/55 px-4 py-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-text/60">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${accent}`}>{value}</div>
      {hint ? <div className="mt-1 text-xs leading-relaxed text-text/60">{hint}</div> : null}
    </div>
  );
}

function TargetCard({ label, value, target, hint, tone }) {
  const percent = target > 0 ? (value / target) * 100 : 0;

  return (
    <div className="rounded-lg border border-white/20 bg-white/55 px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-text/60">{label}</div>
          <div className="mt-2 text-xl font-semibold text-text">{formatCurrency(value)}</div>
        </div>
        <div className="rounded-full border border-white/30 bg-white/55 px-2 py-1 text-xs font-semibold text-text/70">
          {clampPercent(percent).toFixed(0)}%
        </div>
      </div>
      <ProgressBar value={percent} tone={tone} />
      <div className="mt-2 text-xs leading-relaxed text-text/60">
        Target: {formatCurrency(target)}. {hint}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm leading-relaxed text-text/70">
      No finance ledger entries found yet. Capture money movement in Notes with{' '}
      <span className="font-semibold text-text">/income</span>,{' '}
      <span className="font-semibold text-text">/expense</span>,{' '}
      <span className="font-semibold text-text">/loan</span>,{' '}
      <span className="font-semibold text-text">/repay</span>, or{' '}
      <span className="font-semibold text-text">/cashup</span>.
    </div>
  );
}

const LEDGER_EVENT_COMMANDS = ['loan', 'repay', 'cashup'];
const RECONCILIATION_EVENT_COMMANDS = ['updatefunds'];
const LEDGER_EVENT_TYPES = ['finance.loan', 'finance.repay', 'waitering.cashup'];
const RECONCILIATION_EVENT_TYPES = ['finance.updatefunds'];

function eventTime(event) {
  return event?.occurred_at || event?.created_at || '';
}

function eventAmount(event) {
  return amountValue(event?.amounts?.amount);
}

function isLoanEvent(event) {
  return event?.command === 'loan' || event?.event_type === 'finance.loan';
}

function isRepayEvent(event) {
  return event?.command === 'repay' || event?.event_type === 'finance.repay';
}

function isCashupEvent(event) {
  return event?.command === 'cashup' || event?.event_type === 'waitering.cashup';
}

function isUpdateFundsEvent(event) {
  return event?.command === 'updatefunds' || event?.event_type === 'finance.updatefunds';
}

function driftLabel(value) {
  if (value < 0) return 'Untracked outflow / drift';
  if (value > 0) return 'Untracked inflow / correction';
  return 'System matches reality';
}

function cashupCashHome(event) {
  const amounts = event?.amounts || {};
  return amountValue(amounts.cashHome ?? amounts.cash);
}

function eventPerson(event) {
  return String(event?.payload?.person || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

export default function FinancePage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [ledgerEvents, setLedgerEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  usePageHeading(PAGE_HEADING);

  const loadFinanceTransactions = useCallback(async (ownerId) => {
    if (!ownerId) {
      setTransactions([]);
      setLedgerEvents([]);
      return;
    }

    setLoadError(null);
    const { data, error } = await supabase
      .from('finance_transactions')
      .select('id, owner_id, source_note_id, type, amount, category, description, occurred_on, created_at')
      .eq('owner_id', ownerId)
      .order('occurred_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    const { data: eventData, error: eventError } = await supabase
      .from('note_events')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('valid', true)
      .or('scope.eq.personal,scope.is.null')
      .or(
        `command.in.(${[...LEDGER_EVENT_COMMANDS, ...RECONCILIATION_EVENT_COMMANDS].join(',')}),event_type.in.(${[...LEDGER_EVENT_TYPES, ...RECONCILIATION_EVENT_TYPES].join(',')})`
      )
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(200);

    if (eventError) throw eventError;
    setTransactions(data || []);
    setLedgerEvents(eventData || []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (cancelled) return;

        const resolvedUser = data?.user ?? null;
        setUser(resolvedUser);

        if (resolvedUser?.id) {
          await loadFinanceTransactions(resolvedUser.id);
        } else {
          setTransactions([]);
          setLedgerEvents([]);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Could not load finance transactions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadFinanceTransactions]);

  const summary = useMemo(() => {
    const currentMonth = currentMonthKey();
    const totals = transactions.reduce(
      (next, transaction) => {
        const amount = amountValue(transaction.amount);
        if (transaction.type === 'income') next.income += amount;
        if (transaction.type === 'expense') next.expenses += amount;
        if (transaction.type === 'savings') next.savings += amount;

        if (monthKey(transaction.occurred_on) === currentMonth) {
          if (transaction.type === 'income') next.monthIncome += amount;
          if (transaction.type === 'expense') next.monthExpenses += amount;
          if (transaction.type === 'savings') next.monthSavings += amount;
        }

        if (transaction.type === 'income' && transaction.occurred_on) {
          const key = monthKey(transaction.occurred_on);
          next.incomeByMonth[key] = (next.incomeByMonth[key] || 0) + amount;
        }

        return next;
      },
      {
        income: 0,
        expenses: 0,
        savings: 0,
        monthIncome: 0,
        monthExpenses: 0,
        monthSavings: 0,
        borrowedLoanTotal: 0,
        lentLoanTotal: 0,
        repaymentsTowardBorrowedLoans: 0,
        repaymentsTowardLentLoans: 0,
        overpaidBorrowedDebt: 0,
        repayments: 0,
        incomeByMonth: {},
      }
    );

    const loanBalances = new Map();

    ledgerEvents.filter(isCashupEvent).forEach((event) => {
      const amount = cashupCashHome(event);
      totals.income += amount;
      if (monthKey(String(eventTime(event)).slice(0, 10)) === currentMonth) {
        totals.monthIncome += amount;
      }

      const key = monthKey(String(eventTime(event)).slice(0, 10));
      if (key) totals.incomeByMonth[key] = (totals.incomeByMonth[key] || 0) + amount;
    });

    ledgerEvents.filter((event) => isLoanEvent(event) || isRepayEvent(event)).forEach((event) => {
      const amount = eventAmount(event);
      const personKey = eventPerson(event);
      if (!personKey) return;

      const direction = String(event?.payload?.direction || '').toLowerCase();
      const personLabel = event?.payload?.person || 'Unknown';
      const balance = loanBalances.get(personKey) || {
        person: personLabel,
        borrowed: 0,
        lent: 0,
        repaid: 0,
      };

      if (isLoanEvent(event)) {
        if (direction === 'borrowed') balance.borrowed += amount;
        if (direction === 'lent') balance.lent += amount;
      }

      if (isRepayEvent(event)) {
        totals.repayments += amount;
        balance.repaid += amount;
      }

      loanBalances.set(personKey, balance);
    });

    const loanPeople = Array.from(loanBalances.values()).map((balance) => ({
      ...balance,
      outstandingBorrowed: Math.max(0, balance.borrowed - balance.repaid),
      overpaid: balance.borrowed > 0 ? Math.max(0, balance.repaid - balance.borrowed) : 0,
      outstandingLent: Math.max(0, balance.lent - balance.repaid),
    }));
    const matchedLoanPeople = loanPeople.filter((balance) => balance.borrowed > 0 || balance.lent > 0);
    const unmatchedRepayments = loanPeople.filter(
      (balance) => balance.repaid > 0 && balance.borrowed === 0 && balance.lent === 0
    );

    matchedLoanPeople.forEach((balance) => {
      const borrowedRepaymentPaid = Math.min(balance.repaid, balance.borrowed);
      totals.borrowedLoanTotal += balance.borrowed;
      totals.lentLoanTotal += balance.lent;
      totals.repaymentsTowardBorrowedLoans += borrowedRepaymentPaid;
      totals.repaymentsTowardLentLoans += Math.min(balance.repaid, balance.lent);
      totals.overpaidBorrowedDebt += balance.overpaid;
    });

    const incomeMonths = Object.keys(totals.incomeByMonth);
    const averageIncome = incomeMonths.length ? totals.income / incomeMonths.length : 0;
    const outstandingBorrowedDebt = Math.max(0, totals.borrowedLoanTotal - totals.repaymentsTowardBorrowedLoans);
    const moneyOwedToMe = Math.max(0, totals.lentLoanTotal - totals.repaymentsTowardLentLoans);
    const calculatedBalance = totals.income - totals.expenses - totals.savings - totals.repaymentsTowardBorrowedLoans - outstandingBorrowedDebt;
    const fundsSnapshots = ledgerEvents
      .filter(isUpdateFundsEvent)
      .sort((a, b) => new Date(eventTime(b)).getTime() - new Date(eventTime(a)).getTime());
    const latestFundsSnapshot = fundsSnapshots[0] || null;
    const latestFundsAmount = latestFundsSnapshot ? eventAmount(latestFundsSnapshot) : null;
    const reconciliationAdjustment = latestFundsSnapshot ? latestFundsAmount - calculatedBalance : 0;

    return {
      ...totals,
      incomeTotal: totals.income,
      outstandingBorrowedDebt,
      borrowedDebtRepaymentsPaid: totals.repaymentsTowardBorrowedLoans,
      spendableAfterDebt: totals.income - totals.expenses - totals.repaymentsTowardBorrowedLoans - outstandingBorrowedDebt,
      moneyOwedToMe,
      loanPeople: matchedLoanPeople,
      unmatchedRepayments,
      net: calculatedBalance,
      calculatedBalance,
      latestFundsSnapshot,
      reconciliationAdjustment,
      displayedCurrentFunds: latestFundsSnapshot ? latestFundsAmount : calculatedBalance,
      fundsSnapshots,
      averageIncome,
      incomeMonths: incomeMonths.length,
    };
  }, [ledgerEvents, transactions]);

  return (
    <>
      <Head>
        <title>Finance OS</title>
      </Head>

      <section className="mx-auto max-w-6xl space-y-6">
        <Card
          variant="neutral"
          compact={false}
          title="My Finance OS"
          subtitle="Only your personal commands power these totals."
          accent="#34d399"
          className="text-left"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Capture with <span className="font-semibold">/income</span>,{' '}
              <span className="font-semibold">/expense</span>,{' '}
              <span className="font-semibold">/loan</span>,{' '}
              <span className="font-semibold">/repay</span>,{' '}
              <span className="font-semibold">/cashup</span>, or{' '}
              <span className="font-semibold">/updatefunds</span>. Salary and card tips stay out of Finance OS unless entered as{' '}
              <span className="font-semibold">/income</span>.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/shared-finance"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white/65 px-4 py-2 text-sm font-semibold text-cyan-800 shadow hover:bg-white"
              >
                Move-Out HQ
              </Link>
              <Link
                href="/bossa-income"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white/65 px-4 py-2 text-sm font-semibold text-emerald-800 shadow hover:bg-white"
              >
                Bossa Tracking
              </Link>
              <Link
                href="/notes"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
              >
                Capture in Notes
              </Link>
            </div>
          </div>
        </Card>

        {loadError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        {loading ? <div className="text-sm text-text/60">Loading finance transactions...</div> : null}

        {!loading && !user ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-text/80 shadow-sm">
            Sign in to view finance transactions.
          </div>
        ) : null}

        {!loading && user ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <SummaryTile label="Income" value={formatCurrency(summary.incomeTotal)} accent="text-emerald-700" />
              <SummaryTile label="Borrowed loans total" value={formatCurrency(summary.borrowedLoanTotal)} accent="text-amber-700" />
              <SummaryTile
                label="Debt repayments paid"
                value={formatCurrency(summary.borrowedDebtRepaymentsPaid)}
                hint="Cash paid out toward borrowed loans"
                accent="text-violet-700"
              />
              <SummaryTile
                label="Outstanding borrowed debt"
                value={formatCurrency(summary.outstandingBorrowedDebt)}
                hint={`${formatCurrency(summary.overpaidBorrowedDebt)} overpaid`}
                accent="text-amber-700"
              />
              <SummaryTile
                label="Spendable after debt"
                value={formatCurrency(summary.spendableAfterDebt)}
                hint="Income minus expenses, repayments paid, and outstanding borrowed debt."
                accent="text-emerald-700"
              />
              <SummaryTile
                label="Money owed to me"
                value={formatCurrency(summary.moneyOwedToMe)}
                hint={`${formatCurrency(summary.repaymentsTowardLentLoans)} repaid to you`}
                accent="text-cyan-700"
              />
              <SummaryTile label="Repayments logged" value={formatCurrency(summary.repayments)} accent="text-violet-700" />
              <SummaryTile label="Total expenses" value={formatCurrency(summary.expenses)} accent="text-rose-700" />
              <SummaryTile label="Total savings" value={formatCurrency(summary.savings)} accent="text-sky-700" />
              <SummaryTile
                label="Current funds"
                value={formatCurrency(summary.displayedCurrentFunds)}
                hint={summary.latestFundsSnapshot ? 'Latest reality snapshot from /updatefunds.' : 'Calculated from tracked commands.'}
                accent="text-emerald-700"
              />
              <SummaryTile
                label="Unassigned net"
                value={formatCurrency(summary.net)}
                hint="Income minus expenses, savings, repayments paid, and outstanding borrowed debt."
              />
            </div>

            <Card
              variant="neutral"
              compact={false}
              title="Funds reconciliation"
              subtitle="Reality check from the latest /updatefunds command"
              accent="#14b8a6"
              className="text-left"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryTile label="Calculated balance" value={formatCurrency(summary.calculatedBalance)} />
                <SummaryTile
                  label="Latest funds update"
                  value={summary.latestFundsSnapshot ? formatCurrency(eventAmount(summary.latestFundsSnapshot)) : 'No snapshot'}
                  hint={summary.latestFundsSnapshot ? 'Only the newest /updatefunds affects current funds.' : 'Capture /updatefunds amount reason when reality differs.'}
                  accent={summary.latestFundsSnapshot ? 'text-emerald-700' : 'text-text'}
                />
                <SummaryTile
                  label={driftLabel(summary.reconciliationAdjustment)}
                  value={formatCurrency(summary.reconciliationAdjustment)}
                  hint="Latest funds update minus calculated balance."
                  accent={summary.reconciliationAdjustment < 0 ? 'text-rose-700' : summary.reconciliationAdjustment > 0 ? 'text-emerald-700' : 'text-text'}
                />
              </div>

              {summary.latestFundsSnapshot ? (
                <div className="mt-4 rounded-lg border border-slate-200 bg-white/70 px-3 py-3 text-sm leading-relaxed text-text/70">
                  <div>
                    <span className="font-semibold text-text">Reason:</span>{' '}
                    {summary.latestFundsSnapshot.payload?.reason || summary.latestFundsSnapshot.description || 'No reason recorded'}
                  </div>
                  <div className="mt-1 text-xs text-text/55">
                    Updated {formatDateTime(eventTime(summary.latestFundsSnapshot))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm leading-relaxed text-text/70">
                  Use /updatefunds when real cash differs from the system because something was missed.
                </div>
              )}
            </Card>

            <div className="grid gap-3 lg:grid-cols-3">
              <TargetCard
                label="Move-out progress"
                value={summary.savings}
                target={MOVE_OUT_TARGET}
                hint="Based on total savings transactions."
                tone="emerald"
              />
              <TargetCard
                label="Monthly cost target"
                value={summary.monthExpenses}
                target={MONTHLY_COST_TARGET}
                hint="Current-month expenses."
                tone={summary.monthExpenses > MONTHLY_COST_TARGET ? 'rose' : 'amber'}
              />
              <TargetCard
                label="Income target"
                value={summary.averageIncome}
                target={INCOME_TARGET}
                hint={
                  summary.incomeMonths
                    ? `Average across ${summary.incomeMonths} month${summary.incomeMonths === 1 ? '' : 's'}.`
                    : 'No income months recorded yet.'
                }
                tone="emerald"
              />
            </div>

            <Card
              variant="neutral"
              compact={false}
              title="This month"
              subtitle="Current calendar month from transaction dates"
              accent="#60a5fa"
              className="text-left"
            >
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryTile label="Month income" value={formatCurrency(summary.monthIncome)} />
                <SummaryTile label="Month expenses" value={formatCurrency(summary.monthExpenses)} />
                <SummaryTile label="Month savings" value={formatCurrency(summary.monthSavings)} />
              </div>
            </Card>

            <Card
              variant="neutral"
              compact={false}
              title="Recent finance transactions"
              subtitle="Ledger rows linked back to source notes when available"
              accent="#f59e0b"
              className="text-left"
            >
              {transactions.length ? (
                <div className="space-y-3">
                  {transactions.slice(0, 25).map((transaction) => (
                    <article
                      key={transaction.id}
                      className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/40 bg-white/65 px-2 py-0.5 text-xs font-semibold text-text/75">
                            {transaction.type}
                          </span>
                          <span
                            className={[
                              'text-sm font-semibold',
                              transaction.type === 'income'
                                ? 'text-emerald-700'
                                : transaction.type === 'expense'
                                ? 'text-rose-700'
                                : 'text-sky-700',
                            ].join(' ')}
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </div>
                        <time className="text-xs text-text/55" dateTime={transaction.occurred_on}>
                          {formatDate(transaction.occurred_on)}
                        </time>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-text/75">
                        {transaction.category ? (
                          <span className="font-semibold text-text">{transaction.category}</span>
                        ) : (
                          <span className="text-text/50">Uncategorized</span>
                        )}
                        {transaction.description ? <span> - {transaction.description}</span> : null}
                      </div>
                      {transaction.source_note_id ? (
                        <div className="mt-2 text-xs text-text/45">Source note linked.</div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </Card>

            <Card
              variant="neutral"
              compact={false}
              title="Loan and repayment events"
              subtitle="/loan and /repay commands from Notes"
              accent="#a78bfa"
              className="text-left"
            >
              {ledgerEvents.filter((event) => isLoanEvent(event) || isRepayEvent(event)).length ? (
                <div className="space-y-5">
                  {summary.loanPeople.length ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {summary.loanPeople.map((balance) => (
                        <div
                          key={balance.person}
                          className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm"
                        >
                          <div className="text-sm font-semibold text-text">{balance.person}</div>
                          <div className="mt-2 grid gap-2 text-xs text-text/65 sm:grid-cols-2">
                            <div>Borrowed total: {formatCurrency(balance.borrowed)}</div>
                            <div>Debt repayments paid: {formatCurrency(Math.min(balance.repaid, balance.borrowed))}</div>
                            <div>Lent total: {formatCurrency(balance.lent)}</div>
                            <div>Outstanding: {formatCurrency(balance.outstandingBorrowed)}</div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">
                              Debt: {formatCurrency(balance.outstandingBorrowed)}
                            </span>
                            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-semibold text-cyan-800">
                              Owed to me: {formatCurrency(balance.outstandingLent)}
                            </span>
                            {balance.overpaid > 0 ? (
                              <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">
                                Overpaid: {formatCurrency(balance.overpaid)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {summary.unmatchedRepayments.length ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-3 shadow-sm">
                      <div className="text-sm font-semibold text-amber-950">Unmatched repayments</div>
                      <div className="mt-1 text-xs leading-relaxed text-amber-900/75">
                        These repayments have no loan with the same normalized person name. Check spelling before trusting the debt totals.
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-2">
                        {summary.unmatchedRepayments.map((balance) => (
                          <div
                            key={balance.person}
                            className="rounded-md border border-amber-200 bg-white/70 px-3 py-2 text-sm text-amber-950"
                          >
                            <span className="font-semibold">{balance.person}</span>: {formatCurrency(balance.repaid)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {ledgerEvents.filter((event) => isLoanEvent(event) || isRepayEvent(event)).slice(0, 25).map((event) => (
                    <article
                      key={event.id}
                      className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/40 bg-white/65 px-2 py-0.5 text-xs font-semibold text-text/75">
                            /{event.command}
                          </span>
                          <span className="text-sm font-semibold text-violet-700">
                            {formatCurrency(eventAmount(event))}
                          </span>
                        </div>
                        <time className="text-xs text-text/55" dateTime={eventTime(event)}>
                          {formatDate(String(eventTime(event)).slice(0, 10))}
                        </time>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-text/75">
                        {event.payload?.person ? (
                          <span className="font-semibold text-text">{event.payload.person}</span>
                        ) : null}
                        {event.payload?.direction ? <span> - {event.payload.direction}</span> : null}
                        {event.payload?.reason ? <span> - {event.payload.reason}</span> : null}
                      </div>
                      {event.raw ? <div className="mt-2 text-xs text-text/45">{event.raw}</div> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm leading-relaxed text-text/70">
                  No loan or repayment events found yet.
                </div>
              )}
            </Card>
          </>
        ) : null}
      </section>
    </>
  );
}
