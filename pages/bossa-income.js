import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '@/components/CardKit/Card';
import { usePageHeading } from '@/components/Layout/PageShell';
import {
  BOSSA_WEEKLY_SHIFTS_TABLE,
  bossaScheduleMigrationMessage,
  buildWeeklyShiftRows,
  currentWeekStartDate,
  dateForWeekday,
  dateKey,
  formatPlannedShift,
  isMissingBossaScheduleTable,
} from '@/lib/bossaSchedule';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Bossa Tracking',
  subtitle: 'Weekly shifts, clock data, cashups, and optional table detail from Notes.',
};

const BOSSA_COMMANDS = ['table', 'cashup', 'clockin', 'clockout', 'weeklyshifts'];
const BOSSA_EVENT_TYPES = [
  'waitering.table',
  'waitering.cashup',
  'waitering.clockin',
  'waitering.clockout',
  'waitering.weeklyshifts',
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

function isClockIn(event) {
  return event?.command === 'clockin' || event?.event_type === 'waitering.clockin';
}

function isClockOut(event) {
  return event?.command === 'clockout' || event?.event_type === 'waitering.clockout';
}

function isWeeklyShifts(event) {
  return event?.command === 'weeklyshifts' || event?.event_type === 'waitering.weeklyshifts';
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
  if (isClockIn(event)) {
    return `Clock-in logged at ${formatTimestamp(eventTime(event))}.`;
  }
  if (isClockOut(event)) {
    return `Clock-out logged at ${formatTimestamp(eventTime(event))}.`;
  }
  if (isWeeklyShifts(event)) {
    return event.description || 'Weekly Bossa shifts updated.';
  }

  return event?.raw || event?.label || 'Bossa tracking event';
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function eventTimeOnly(event) {
  const timestamp = eventTime(event);
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function WeeklyShiftStatus({ row }) {
  const planned = row.planned;
  const hasClockin = Boolean(row.clockin);
  const hasClockout = Boolean(row.clockout);

  let label = 'Not set';
  let className = 'border-slate-200 bg-white/70 text-text/65';

  if (planned?.status === 'off') {
    label = hasClockin || hasClockout ? 'Extra shift' : 'Off';
    className = hasClockin || hasClockout
      ? 'border-cyan-200 bg-cyan-50 text-cyan-800'
      : 'border-slate-200 bg-white/70 text-text/65';
  } else if (planned?.status === 'scheduled') {
    if (hasClockin && hasClockout) {
      label = 'Clocked';
      className = 'border-emerald-200 bg-emerald-50 text-emerald-800';
    } else if (hasClockin) {
      label = 'In progress';
      className = 'border-amber-200 bg-amber-50 text-amber-800';
    } else {
      label = 'Planned';
      className = 'border-blue-200 bg-blue-50 text-blue-800';
    }
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

export default function BossaIncomePage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [weeklyShifts, setWeeklyShifts] = useState([]);
  const [weekStartDate, setWeekStartDate] = useState(() => currentWeekStartDate());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [scheduleError, setScheduleError] = useState(null);

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

  const loadWeeklyShifts = useCallback(async (ownerId) => {
    if (!ownerId) {
      setWeeklyShifts([]);
      return;
    }

    const resolvedWeekStart = currentWeekStartDate();
    setWeekStartDate(resolvedWeekStart);
    setScheduleError(null);

    const { data, error } = await supabase
      .from(BOSSA_WEEKLY_SHIFTS_TABLE)
      .select('*')
      .eq('owner_id', ownerId)
      .eq('week_start_date', resolvedWeekStart)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    setWeeklyShifts(data || []);
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
          try {
            await loadWeeklyShifts(resolvedUser.id);
          } catch (scheduleLoadError) {
            if (isMissingBossaScheduleTable(scheduleLoadError)) {
              setScheduleError(bossaScheduleMigrationMessage());
            } else {
              setScheduleError(scheduleLoadError?.message || 'Could not load weekly shifts.');
            }
            setWeeklyShifts([]);
          }
        } else {
          setEvents([]);
          setWeeklyShifts([]);
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
  }, [loadBossaEvents, loadWeeklyShifts]);

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

  const weeklyRows = useMemo(() => {
    const weekEndDate = addDays(weekStartDate, 7);
    const clockEvents = events.filter((event) => {
      if (!isClockIn(event) && !isClockOut(event)) return false;
      const key = dateKey(eventTime(event));
      return key >= weekStartDate && key < weekEndDate;
    });

    return buildWeeklyShiftRows({
      weekStartDate,
      shifts: weeklyShifts,
      clockEvents,
    });
  }, [events, weekStartDate, weeklyShifts]);

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
          subtitle="/weeklyshifts plans the week. /clockin and /clockout show actuals. /cashup feeds Finance OS."
          accent="#f59e0b"
          className="text-left"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Use <span className="font-semibold">/cashup</span> for shift cash taken home and{' '}
              <span className="font-semibold">/weeklyshifts</span> for the planned rota.
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
              title="Weekly Shifts"
              subtitle={`Week of ${weekStartDate}`}
              accent="#f59e0b"
              className="text-left"
            >
              {scheduleError ? (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  {scheduleError}
                </div>
              ) : null}
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-text/55">
                      <th className="px-3 py-1 font-semibold">Day</th>
                      <th className="px-3 py-1 font-semibold">Planned shift</th>
                      <th className="px-3 py-1 font-semibold">Actual clock-in/out</th>
                      <th className="px-3 py-1 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyRows.map((row) => {
                      const clockin = eventTimeOnly(row.clockin);
                      const clockout = eventTimeOnly(row.clockout);
                      const actual = clockin || clockout
                        ? `${clockin || 'Not clocked in'} - ${clockout || 'Not clocked out'}`
                        : 'No actual data yet';

                      return (
                        <tr key={row.day_of_week} className="rounded-lg bg-white/65 shadow-sm">
                          <td className="rounded-l-lg border-y border-l border-slate-200 px-3 py-3">
                            <div className="font-semibold text-text">{row.label}</div>
                            <div className="text-xs text-text/45">{dateForWeekday(weekStartDate, row.day_of_week)}</div>
                          </td>
                          <td className="border-y border-slate-200 px-3 py-3 text-text/75">
                            {formatPlannedShift(row.planned)}
                          </td>
                          <td className="border-y border-slate-200 px-3 py-3 text-text/75">
                            {actual}
                          </td>
                          <td className="rounded-r-lg border-y border-r border-slate-200 px-3 py-3">
                            <WeeklyShiftStatus row={row} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-text/50">
                Week start uses the browser/server local date because no dedicated timezone helper exists yet.
              </p>
            </Card>

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
