import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { usePageHeading } from '@/components/Layout/PageShell';
import Card from '@/components/CardKit/Card';

const PAGE_HEADING = {
  emoji: '',
  title: 'Waitering',
  subtitle: 'A lens over Notes command events.',
};

const WAITING_COMMANDS = ['cashup', 'table'];
const WAITING_EVENT_TYPES = ['waitering.cashup', 'waitering.table'];

function amountValue(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  return `R ${num.toFixed(2)}`;
}

function formatPercent(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
}

function formatTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function isToday(value) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function eventTime(event) {
  return event?.occurred_at || event?.created_at || '';
}

function isCashupEvent(event) {
  return event?.command === 'cashup' || event?.event_type === 'waitering.cashup';
}

function isTableEvent(event) {
  return event?.command === 'table' || event?.event_type === 'waitering.table';
}

function summarizeEvent(event) {
  const amounts = event?.amounts || {};
  const payload = event?.payload || {};

  if (isCashupEvent(event)) {
    const turnover = amountValue(amounts.turnover);
    const retained = amountValue(amounts.retained);
    const cash = amountValue(amounts.cash);
    const retainedPercentage =
      amounts.retainedPercentage != null
        ? Number(amounts.retainedPercentage)
        : turnover > 0
        ? (retained / turnover) * 100
        : null;
    return `Cashup: ${formatCurrency(turnover)} turnover, ${formatCurrency(retained)} retained, ${formatCurrency(cash)} cash, ${formatPercent(retainedPercentage)} retained.`;
  }

  if (isTableEvent(event)) {
    const tableNumber = payload.tableNumber || event.label?.replace(/^Table\s+/i, '') || '';
    const billTotal = amountValue(amounts.billTotal);
    const amountTendered = amountValue(amounts.amountTendered);
    const tip = amounts.tip != null ? Number(amounts.tip) : amountTendered - billTotal;
    const tipPercentage =
      amounts.tipPercentage != null ? Number(amounts.tipPercentage) : billTotal > 0 ? (tip / billTotal) * 100 : null;
    return `Table ${tableNumber}: ${formatCurrency(billTotal)} bill, ${formatCurrency(amountTendered)} tendered, ${formatCurrency(tip)} tip, ${formatPercent(tipPercentage)} tip.`;
  }

  return event?.raw || event?.label || 'Waitering event';
}

function SummaryTile({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/55 px-4 py-3 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-text/60">{label}</div>
      <div className="mt-1 text-xl font-semibold text-text">{value}</div>
      {hint ? <div className="mt-1 text-xs text-text/60">{hint}</div> : null}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm text-text/70">
      No waitering events found yet. Capture waitering data in Notes using{' '}
      <span className="font-semibold text-text">/cashup</span> and{' '}
      <span className="font-semibold text-text">/table</span> commands.
    </div>
  );
}

export default function WaiteringPage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  usePageHeading(PAGE_HEADING);

  const loadWaiteringEvents = useCallback(async (ownerId) => {
    if (!ownerId) {
      setEvents([]);
      return;
    }

    setLoadError(null);
    const { data, error } = await supabase
      .from('note_events')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('valid', true)
      .or(
        `command.in.(${WAITING_COMMANDS.join(',')}),event_type.in.(${WAITING_EVENT_TYPES.join(',')})`
      )
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    setEvents(data || []);
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
          await loadWaiteringEvents(resolvedUser.id);
        } else {
          setEvents([]);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Could not load waitering events.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadWaiteringEvents]);

  const cashupEvents = useMemo(() => events.filter(isCashupEvent), [events]);
  const tableEvents = useMemo(() => events.filter(isTableEvent), [events]);
  const latestCashup = cashupEvents[0] || null;

  const summary = useMemo(() => {
    const todayCashups = cashupEvents.filter((event) => isToday(eventTime(event)));

    const allCashupTotals = cashupEvents.reduce(
      (totals, event) => {
        const amounts = event.amounts || {};
        totals.turnover += amountValue(amounts.turnover);
        totals.retained += amountValue(amounts.retained);
        totals.cash += amountValue(amounts.cash);
        totals.nonCashRetained += amountValue(
          amounts.nonCashRetained != null
            ? amounts.nonCashRetained
            : amountValue(amounts.retained) - amountValue(amounts.cash)
        );
        return totals;
      },
      { turnover: 0, retained: 0, cash: 0, nonCashRetained: 0 }
    );

    const todayCashupTotals = todayCashups.reduce(
      (totals, event) => {
        const amounts = event.amounts || {};
        totals.turnover += amountValue(amounts.turnover);
        totals.retained += amountValue(amounts.retained);
        totals.cash += amountValue(amounts.cash);
        return totals;
      },
      { turnover: 0, retained: 0, cash: 0 }
    );

    const tableTotals = tableEvents.reduce(
      (totals, event) => {
        const amounts = event.amounts || {};
        const billTotal = amountValue(amounts.billTotal);
        const tip = amounts.tip != null ? Number(amounts.tip) : amountValue(amounts.amountTendered) - billTotal;
        totals.billTotal += billTotal;
        totals.tips += Number.isFinite(tip) ? tip : 0;
        if (Number.isFinite(Number(amounts.tipPercentage))) {
          totals.tipPercentages.push(Number(amounts.tipPercentage));
        }
        return totals;
      },
      { billTotal: 0, tips: 0, tipPercentages: [] }
    );

    const retainedPercentage =
      allCashupTotals.turnover > 0 ? (allCashupTotals.retained / allCashupTotals.turnover) * 100 : null;
    const averageTableTipPercentage = tableTotals.tipPercentages.length
      ? tableTotals.tipPercentages.reduce((total, value) => total + value, 0) / tableTotals.tipPercentages.length
      : null;

    return {
      todayCashupTotals,
      allCashupTotals,
      retainedPercentage,
      tableTotals,
      averageTableTipPercentage,
    };
  }, [cashupEvents, tableEvents]);

  return (
    <>
      <Head>
        <title>Waitering</title>
      </Head>

      <section className="mx-auto max-w-6xl space-y-6">
        <Card
          variant="neutral"
          compact={false}
          title="Notes-powered waitering"
          subtitle="Capture waitering data in Notes using /cashup and /table commands."
          accent="#34d399"
          className="text-left"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              This page now reads structured waitering events from <span className="font-semibold">note_events</span>.
              Notes stay the source stream; this is only the lens.
            </p>
            <Link
              href="/notes"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
            >
              Capture in Notes
            </Link>
          </div>
        </Card>

        {loadError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {loadError}
          </div>
        ) : null}

        {loading ? <div className="text-sm text-text/60">Loading waitering events...</div> : null}

        {!loading && !user ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-text/80 shadow-sm">
            Sign in to view waitering events.
          </div>
        ) : null}

        {!loading && user ? (
          <>
            {latestCashup ? (
              <Card
                variant="success"
                compact={false}
                title="Latest cashup"
                subtitle={formatTimestamp(eventTime(latestCashup))}
                className="text-left"
              >
                <p className="text-sm leading-relaxed text-text/80">{summarizeEvent(latestCashup)}</p>
              </Card>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <SummaryTile
                label="Today turnover"
                value={formatCurrency(summary.todayCashupTotals.turnover)}
                hint="From today's /cashup events"
              />
              <SummaryTile
                label="Today retained"
                value={formatCurrency(summary.todayCashupTotals.retained)}
                hint={`${formatCurrency(summary.todayCashupTotals.cash)} cash`}
              />
              <SummaryTile label="Total turnover" value={formatCurrency(summary.allCashupTotals.turnover)} />
              <SummaryTile label="Total retained" value={formatCurrency(summary.allCashupTotals.retained)} />
              <SummaryTile label="Total cash" value={formatCurrency(summary.allCashupTotals.cash)} />
              <SummaryTile
                label="Non-cash retained"
                value={formatCurrency(summary.allCashupTotals.nonCashRetained)}
              />
              <SummaryTile label="Retained %" value={formatPercent(summary.retainedPercentage)} />
              <SummaryTile label="Tables recorded" value={tableEvents.length} />
              <SummaryTile label="Table bill total" value={formatCurrency(summary.tableTotals.billTotal)} />
              <SummaryTile label="Table tips" value={formatCurrency(summary.tableTotals.tips)} />
              <SummaryTile label="Avg table tip %" value={formatPercent(summary.averageTableTipPercentage)} />
            </div>

            <Card
              variant="neutral"
              compact={false}
              title="Recent waitering events"
              subtitle="/cashup and /table events from Notes"
              accent="#60a5fa"
              className="text-left"
            >
              {events.length ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-text">
                          /{event.command || 'event'}{' '}
                          <span className="text-xs font-medium text-text/55">{event.event_type}</span>
                        </div>
                        <time className="text-xs text-text/55" dateTime={eventTime(event)}>
                          {formatTimestamp(eventTime(event))}
                        </time>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-text/75">{summarizeEvent(event)}</p>
                      {event.raw ? <p className="mt-2 text-xs text-text/50">{event.raw}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </Card>
          </>
        ) : null}
      </section>
    </>
  );
}
