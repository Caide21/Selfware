import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '@/components/CardKit/Card';
import { usePageHeading } from '@/components/Layout/PageShell';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Bossa Tracking',
  subtitle: 'Cashups and optional table detail from Notes.',
};

const BOSSA_COMMANDS = ['table', 'cashup'];
const BOSSA_EVENT_TYPES = [
  'waitering.table',
  'waitering.cashup',
];

function amountValue(value) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  return `R ${num.toFixed(2)}`;
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

function eventTime(event) {
  return event?.occurred_at || event?.created_at || '';
}

function tableTip(event) {
  const amounts = event?.amounts || {};
  if (amounts.tip != null) return amountValue(amounts.tip);
  return amountValue(amounts.amountTendered) - amountValue(amounts.billTotal);
}

function isTable(event) {
  return event?.command === 'table' || event?.event_type === 'waitering.table';
}

function isCashup(event) {
  return event?.command === 'cashup' || event?.event_type === 'waitering.cashup';
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

function describeEvent(event) {
  const payload = event?.payload || {};
  const amounts = event?.amounts || {};

  if (isTable(event)) {
    const tableNumber = payload.tableNumber || event.label?.replace(/^Table\s+/i, '') || '';
    return `Table ${tableNumber}: ${formatCurrency(amounts.billTotal)} bill, ${formatCurrency(amounts.amountTendered)} tendered, ${formatCurrency(tableTip(event))} tip.`;
  }
  if (isCashup(event)) {
    return `Cashup: ${formatCurrency(amounts.turnover)} turnover, ${formatCurrency(amounts.retained)} retained, ${formatCurrency(amounts.cashHome ?? amounts.cash)} cashHome.`;
  }

  return event?.raw || event?.label || 'Bossa tracking event';
}

export default function BossaIncomePage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  usePageHeading(PAGE_HEADING);

  const loadBossaEvents = useCallback(async (ownerId) => {
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
      .or('scope.eq.personal,scope.is.null')
      .or(
        `command.in.(${BOSSA_COMMANDS.join(',')}),event_type.in.(${BOSSA_EVENT_TYPES.join(',')})`
      )
      .order('occurred_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(200);

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
          await loadBossaEvents(resolvedUser.id);
        } else {
          setEvents([]);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Could not load Bossa tracking.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [loadBossaEvents]);

  const summary = useMemo(() => {
    const cashupEvents = events.filter(isCashup);
    const tableEvents = events.filter(isTable);
    const tableTipsTotal = tableEvents.reduce((total, event) => total + tableTip(event), 0);
    const cashHomeTotal = cashupEvents.reduce((total, event) => {
      const amounts = event?.amounts || {};
      return total + amountValue(amounts.cashHome ?? amounts.cash);
    }, 0);
    const turnoverTotal = cashupEvents.reduce((total, event) => total + amountValue(event?.amounts?.turnover), 0);
    const retainedTotal = cashupEvents.reduce((total, event) => total + amountValue(event?.amounts?.retained), 0);

    return {
      tableTipsTotal,
      tableEvents,
      cashupEvents,
      cashHomeTotal,
      turnoverTotal,
      retainedTotal,
    };
  }, [events]);

  return (
    <>
      <Head>
        <title>Bossa Tracking</title>
      </Head>

      <section className="mx-auto max-w-6xl space-y-6">
        <Card
          variant="neutral"
          compact={false}
          title="Bossa tracking"
          subtitle="/cashup adds cashHome to Finance OS. /table tracks optional table detail."
          accent="#f59e0b"
          className="text-left"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Use <span className="font-semibold">/cashup</span> for shift cash taken home and{' '}
              <span className="font-semibold">/table</span> when you want extra table detail.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/finance"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-200 bg-white/65 px-4 py-2 text-sm font-semibold text-amber-800 shadow hover:bg-white"
              >
                Finance OS
              </Link>
              <Link
                href="/notes"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
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

        {loading ? <div className="text-sm text-text/60">Loading Bossa tracking...</div> : null}

        {!loading && !user ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-text/80 shadow-sm">
            Sign in to view Bossa tracking.
          </div>
        ) : null}

        {!loading && user ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <SummaryTile label="Finance OS income" value={formatCurrency(summary.cashHomeTotal)} hint="Cash taken home from /cashup." accent="text-emerald-700" />
              <SummaryTile label="Cashups logged" value={summary.cashupEvents.length} />
              <SummaryTile label="Turnover tracked" value={formatCurrency(summary.turnoverTotal)} hint="Tracking only. Not income." accent="text-amber-700" />
              <SummaryTile label="Retained tracked" value={formatCurrency(summary.retainedTotal)} hint="Tracking only. Not income." accent="text-orange-700" />
              <SummaryTile label="Tables logged" value={summary.tableEvents.length} />
              <SummaryTile label="Table-derived tips" value={formatCurrency(summary.tableTipsTotal)} accent="text-cyan-700" />
            </div>

            <Card
              variant="neutral"
              compact={false}
              title="Cashup entries"
              subtitle="/cashup evidence for review"
              accent="#60a5fa"
              className="text-left"
            >
              {summary.cashupEvents.length ? (
                <div className="space-y-3">
                  {summary.cashupEvents.map((event) => (
                    <article key={event.id} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-text">/{event.command}</div>
                        <time className="text-xs text-text/55" dateTime={eventTime(event)}>
                          {formatTimestamp(eventTime(event))}
                        </time>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-text/75">{describeEvent(event)}</p>
                      {event.raw ? <p className="mt-2 text-xs text-text/50">{event.raw}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm text-text/70">
                  No cashups logged yet.
                </div>
              )}
            </Card>

            <Card
              variant="neutral"
              compact={false}
              title="Recent Bossa tracking"
              subtitle="/cashup and /table commands from Notes"
              accent="#f59e0b"
              className="text-left"
            >
              {events.length ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <article key={event.id} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-text">
                          /{event.command || 'event'}{' '}
                          <span className="text-xs font-medium text-text/55">{event.event_type}</span>
                        </div>
                        <time className="text-xs text-text/55" dateTime={eventTime(event)}>
                          {formatTimestamp(eventTime(event))}
                        </time>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-text/75">{describeEvent(event)}</p>
                      {event.raw ? <p className="mt-2 text-xs text-text/50">{event.raw}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm leading-relaxed text-text/70">
                  No Bossa tracking found yet. Capture logs in Notes with /cashup or /table.
                </div>
              )}
            </Card>
          </>
        ) : null}
      </section>
    </>
  );
}
