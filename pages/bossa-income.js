import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '@/components/CardKit/Card';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { usePageHeading } from '@/components/Layout/PageShell';
import { createFinanceTransactionRow, parseFinanceCommand } from '@/lib/financeCommands';
import { parseNoteCommand } from '@/lib/parseNoteCommand';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Bossa Income',
  subtitle: 'Raw Bossa income evidence before Finance OS verification.',
};

const BOSSA_COMMANDS = ['salary', 'tips', 'tipfix', 'table', 'cashup'];
const BOSSA_EVENT_TYPES = [
  'finance.salary',
  'finance.tips',
  'finance.tipfix',
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

function eventAmount(event) {
  return amountValue(event?.amounts?.amount);
}

function tableTip(event) {
  const amounts = event?.amounts || {};
  if (amounts.tip != null) return amountValue(amounts.tip);
  return amountValue(amounts.amountTendered) - amountValue(amounts.billTotal);
}

function isCommand(event, command) {
  return event?.command === command || event?.event_type === `finance.${command}`;
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

  if (isCommand(event, 'salary')) return `${formatCurrency(eventAmount(event))} salary from ${payload.source || event.description || 'source'}.`;
  if (isCommand(event, 'tips')) return `${formatCurrency(eventAmount(event))} manual tips from ${payload.source || event.description || 'source'}.`;
  if (isCommand(event, 'tipfix')) return `${formatCurrency(eventAmount(event))} corrected tips: ${payload.reason || event.description || 'reason logged'}.`;
  if (isTable(event)) {
    const tableNumber = payload.tableNumber || event.label?.replace(/^Table\s+/i, '') || '';
    return `Table ${tableNumber}: ${formatCurrency(amounts.billTotal)} bill, ${formatCurrency(amounts.amountTendered)} tendered, ${formatCurrency(tableTip(event))} tip.`;
  }
  if (isCashup(event)) {
    return `Cashup: ${formatCurrency(amounts.turnover)} turnover, ${formatCurrency(amounts.retained)} retained, ${formatCurrency(amounts.cash)} cash.`;
  }

  return event?.raw || event?.label || 'Bossa income evidence';
}

export default function BossaIncomePage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [createStatus, setCreateStatus] = useState(null);
  const [creating, setCreating] = useState(false);

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
        if (!cancelled) setLoadError(error?.message || 'Could not load Bossa income evidence.');
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
    const salaryTotal = events.filter((event) => isCommand(event, 'salary')).reduce((total, event) => total + eventAmount(event), 0);
    const manualTipsTotal = events.filter((event) => isCommand(event, 'tips')).reduce((total, event) => total + eventAmount(event), 0);
    const correctedTipsTotal = events.filter((event) => isCommand(event, 'tipfix')).reduce((total, event) => total + eventAmount(event), 0);
    const tableTipsTotal = events.filter(isTable).reduce((total, event) => total + tableTip(event), 0);
    const cashupEvents = events.filter(isCashup);
    const reviewedTipsTotal = correctedTipsTotal > 0 ? correctedTipsTotal : manualTipsTotal + tableTipsTotal;

    return {
      salaryTotal,
      manualTipsTotal,
      correctedTipsTotal,
      tableTipsTotal,
      cashupEvents,
      suggestedTotal: salaryTotal + reviewedTipsTotal,
      usesTipfix: correctedTipsTotal > 0,
    };
  }, [events]);

  const handleCreateVerifiedIncome = async () => {
    if (!user?.id || summary.suggestedTotal <= 0 || creating) return;

    setCreating(true);
    setCreateStatus(null);

    try {
      const amount = summary.suggestedTotal.toFixed(2);
      const content = `/income ${amount} Bossa verified total`;
      const parsed = parseNoteCommand(content);
      const financeParsed = parseFinanceCommand(content);

      if (!parsed?.valid || !financeParsed?.valid) {
        throw new Error(parsed?.error || financeParsed?.error || 'Could not structure verified income note.');
      }

      const { data: note, error: noteError } = await supabase
        .from('notes')
        .insert({
          content,
          zone: 'general',
          note_type: 'note',
          owner_id: user.id,
        })
        .select('*')
        .single();

      if (noteError) throw noteError;

      const { error: eventError } = await supabase.from('note_events').insert({
        note_id: note.id,
        owner_id: user.id,
        command: parsed.command,
        event_type: parsed.event_type,
        raw: parsed.raw,
        label: parsed.label || null,
        description: parsed.description || null,
        amounts: parsed.amounts || {},
        payload: parsed.payload || {},
        valid: parsed.valid,
        parse_version: parsed.parse_version || 1,
      });

      if (eventError) throw eventError;

      const financeTransaction = createFinanceTransactionRow({
        parsed: financeParsed,
        ownerId: user.id,
        sourceNote: note,
      });

      if (financeTransaction) {
        const { error: financeError } = await supabase.from('finance_transactions').insert(financeTransaction);
        if (financeError) throw financeError;
      }

      setCreateStatus(`Verified income note created: ${content}`);
    } catch (error) {
      setCreateStatus(error?.message || 'Could not create verified income note.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Bossa Income</title>
      </Head>

      <section className="mx-auto max-w-6xl space-y-6">
        <Card
          variant="neutral"
          compact={false}
          title="Bossa income evidence"
          subtitle="Salary, tips, table tips, and cashups live here before ledger verification."
          accent="#f59e0b"
          className="text-left"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Raw Bossa commands are not Finance OS totals. Review the evidence, then create a verified{' '}
              <span className="font-semibold">/income</span> note when the number is ready.
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

        {loading ? <div className="text-sm text-text/60">Loading Bossa income evidence...</div> : null}

        {!loading && !user ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-text/80 shadow-sm">
            Sign in to view Bossa income evidence.
          </div>
        ) : null}

        {!loading && user ? (
          <>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <SummaryTile label="Salary total" value={formatCurrency(summary.salaryTotal)} accent="text-emerald-700" />
              <SummaryTile label="Manual tips" value={formatCurrency(summary.manualTipsTotal)} accent="text-amber-700" />
              <SummaryTile
                label="Corrected tips"
                value={formatCurrency(summary.correctedTipsTotal)}
                hint={summary.usesTipfix ? 'Used for suggested total.' : 'No /tipfix override logged.'}
                accent="text-orange-700"
              />
              <SummaryTile label="Table-derived tips" value={formatCurrency(summary.tableTipsTotal)} accent="text-cyan-700" />
              <SummaryTile label="Cashups logged" value={summary.cashupEvents.length} />
              <SummaryTile
                label="Suggested Bossa total"
                value={formatCurrency(summary.suggestedTotal)}
                hint={summary.usesTipfix ? 'Salary plus corrected tips.' : 'Salary plus manual and table tips.'}
                accent="text-emerald-700"
              />
            </div>

            <Card
              variant="neutral"
              compact={false}
              title="Verification action"
              subtitle="This writes a normal Notes command. It does not mutate raw Bossa evidence."
              accent="#34d399"
              className="text-left"
            >
              <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Suggested command:{' '}
                  <code className="rounded bg-white/60 px-2 py-1 text-xs text-text">
                    /income {summary.suggestedTotal.toFixed(2)} Bossa verified total
                  </code>
                </p>
                <PrimaryButton
                  type="button"
                  onClick={handleCreateVerifiedIncome}
                  disabled={creating || summary.suggestedTotal <= 0}
                  className="px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create verified /income note'}
                </PrimaryButton>
              </div>
              {createStatus ? <div className="mt-3 text-sm text-text/65">{createStatus}</div> : null}
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
              title="Recent Bossa evidence"
              subtitle="/salary, /tips, /tipfix, /table, and /cashup commands from Notes"
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
                  No Bossa income evidence found yet. Capture raw logs in Notes with /salary, /tips, /tipfix, /table, or /cashup.
                </div>
              )}
            </Card>
          </>
        ) : null}
      </section>
    </>
  );
}
