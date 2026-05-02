import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Card from '@/components/CardKit/Card';
import { usePageHeading } from '@/components/Layout/PageShell';
import { addHouseholdMemberByUserId, createHousehold, isHouseholdOwner, listHouseholds } from '@/lib/households';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Move-Out HQ',
  subtitle: 'Two separate wallets. One shared mission.',
};

const SHARED_COMMANDS = ['sharedexpense', 'contribute'];
const SHARED_EVENT_TYPES = ['shared_finance.sharedexpense', 'shared_finance.contribute'];
const EXAMPLE_SHARED_EXPENSES = [
  '/sharedexpense 11000 rent monthly rent estimate',
  '/sharedexpense 11000 deposit once-off rent deposit',
  '/sharedexpense 5000 setup mattresses fridge kettle microwave gas stove',
  '/sharedexpense 1000 wifi monthly wifi',
  '/sharedexpense 2050 utilities electricity water rates',
  '/sharedexpense 2500 travel monthly travel',
  '/sharedexpense 1000 cleaning starter cleaning supplies',
];
const EXAMPLE_CONTRIBUTIONS = [
  '/contribute 3000 moveout Caide May contribution',
  '/contribute 2500 moveout Justin May contribution',
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

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function eventTime(event) {
  return event?.occurred_at || event?.created_at || '';
}

function isSharedExpense(event) {
  return event?.command === 'sharedexpense' || event?.event_type === 'shared_finance.sharedexpense';
}

function isContribution(event) {
  return event?.command === 'contribute' || event?.event_type === 'shared_finance.contribute';
}

function ownerLabel(ownerId, currentUserId) {
  if (!ownerId) return 'Unknown member';
  if (ownerId === currentUserId) return 'You';
  return String(ownerId).slice(0, 8);
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
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

function ProgressBar({ value }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/45">
      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${clampPercent(value)}%` }} />
    </div>
  );
}

function ExampleCommands() {
  return (
    <Card
      variant="neutral"
      compact={false}
      title="Example commands"
      subtitle="Examples only. Nothing is inserted automatically."
      accent="#a78bfa"
      className="text-left"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-text/55">Shared expenses</div>
          <div className="mt-3 space-y-2">
            {EXAMPLE_SHARED_EXPENSES.map((example) => (
              <code key={example} className="block overflow-x-auto rounded bg-white/60 px-2 py-1 text-xs text-text">
                {example}
              </code>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-text/55">Contributions</div>
          <div className="mt-3 space-y-2">
            {EXAMPLE_CONTRIBUTIONS.map((example) => (
              <code key={example} className="block overflow-x-auto rounded bg-white/60 px-2 py-1 text-xs text-text">
                {example}
              </code>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function SharedFinancePage() {
  const [user, setUser] = useState(null);
  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  usePageHeading(PAGE_HEADING);

  const loadSharedEvents = useCallback(async (householdId) => {
    if (!householdId) {
      setEvents([]);
      return;
    }

    setEventsLoading(true);
    setLoadError(null);

    try {
      const { data, error } = await supabase
        .from('note_events')
        .select('*')
        .eq('valid', true)
        .eq('scope', 'household')
        .eq('household_id', householdId)
        .or(`command.in.(${SHARED_COMMANDS.join(',')}),event_type.in.(${SHARED_EVENT_TYPES.join(',')})`)
        .order('occurred_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setEvents(data || []);
    } finally {
      setEventsLoading(false);
    }
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
          const householdData = await listHouseholds(supabase);
          if (cancelled) return;
          setHouseholds(householdData);
          setSelectedHouseholdId((current) => current || householdData[0]?.id || '');
        } else {
          setHouseholds([]);
          setSelectedHouseholdId('');
          setEvents([]);
        }
      } catch (error) {
        if (!cancelled) setLoadError(error?.message || 'Could not load Move-Out HQ.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.id || !selectedHouseholdId) {
      setEvents([]);
      return;
    }

    loadSharedEvents(selectedHouseholdId).catch((error) => {
      setLoadError(error?.message || 'Could not load Move-Out HQ.');
    });
  }, [loadSharedEvents, selectedHouseholdId, user?.id]);

  const selectedHousehold = households.find((household) => household.id === selectedHouseholdId) || null;
  const canManageMembers = isHouseholdOwner(selectedHousehold, user?.id);

  const refreshHouseholds = useCallback(async () => {
    const householdData = await listHouseholds(supabase);
    setHouseholds(householdData);
    setSelectedHouseholdId((current) => current || householdData[0]?.id || '');
    return householdData;
  }, []);

  const handleCreateHousehold = async (event) => {
    event.preventDefault();
    if (!user?.id) return;

    setLoadError(null);

    try {
      const household = await createHousehold(supabase, { name: householdName, userId: user.id });
      setHouseholds((current) => [...current, household]);
      setSelectedHouseholdId(household.id);
      setHouseholdName('');
    } catch (error) {
      setLoadError(error?.message || 'Could not create household.');
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!selectedHouseholdId) return;

    setLoadError(null);

    try {
      await addHouseholdMemberByUserId(supabase, {
        householdId: selectedHouseholdId,
        userId: memberUserId,
      });
      setMemberUserId('');
      await refreshHouseholds();
    } catch (error) {
      setLoadError(error?.message || 'Could not add household member.');
    }
  };

  const summary = useMemo(() => {
    const sharedExpenses = events.filter(isSharedExpense);
    const contributions = events.filter(isContribution);
    const sharedExpenseTotal = sharedExpenses.reduce((total, event) => total + amountValue(event?.amounts?.amount), 0);
    const contributionTotal = contributions.reduce((total, event) => total + amountValue(event?.amounts?.amount), 0);
    const contributionsByUser = new Map();
    const sharedExpensesByCategory = new Map();

    contributions.forEach((event) => {
      const label = ownerLabel(event.owner_id, user?.id);
      contributionsByUser.set(label, (contributionsByUser.get(label) || 0) + amountValue(event?.amounts?.amount));
    });

    sharedExpenses.forEach((event) => {
      const category = event?.payload?.category || event?.label || 'uncategorized';
      sharedExpensesByCategory.set(category, (sharedExpensesByCategory.get(category) || 0) + amountValue(event?.amounts?.amount));
    });

    return {
      sharedExpenseTotal,
      contributionTotal,
      remainingNeeded: Math.max(0, sharedExpenseTotal - contributionTotal),
      progressPercent: sharedExpenseTotal > 0 ? clampPercent((contributionTotal / sharedExpenseTotal) * 100) : 0,
      contributionsByUser: Array.from(contributionsByUser.entries()).map(([label, amount]) => ({ label, amount })),
      sharedExpensesByCategory: Array.from(sharedExpensesByCategory.entries()).map(([label, amount]) => ({ label, amount })),
    };
  }, [events, user?.id]);

  return (
    <>
      <Head>
        <title>Move-Out HQ</title>
      </Head>

      <section className="mx-auto max-w-6xl space-y-6">
        <Card
          variant="neutral"
          compact={false}
          title="Move-Out HQ"
          subtitle="Two separate wallets. One shared mission."
          accent="#22d3ee"
          className="text-left"
        >
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-text/75 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl">
              Track what we need, what we have contributed, and how close we are to moving out.{' '}
              Use <span className="font-semibold">/sharedexpense</span> for shared costs and{' '}
              <span className="font-semibold">/contribute</span> when either of you adds money toward the plan.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/finance"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white/65 px-4 py-2 text-sm font-semibold text-cyan-800 shadow hover:bg-white"
              >
                My Finance OS
              </Link>
              <Link
                href="/notes"
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow hover:brightness-110"
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

        {loading ? <div className="text-sm text-text/60">Loading Move-Out HQ...</div> : null}
        {eventsLoading ? <div className="text-sm text-text/60">Loading shared commands...</div> : null}

        {!loading && !user ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-text/80 shadow-sm">
            Sign in to view Move-Out HQ.
          </div>
        ) : null}

        {!loading && user && !households.length ? (
          <Card
            variant="neutral"
            compact={false}
            title="Create a household"
            subtitle="Create a household to start Move-Out HQ."
            accent="#22d3ee"
            className="text-left"
          >
            <form onSubmit={handleCreateHousehold} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={householdName}
                onChange={(event) => setHouseholdName(event.target.value)}
                placeholder="Move-Out HQ"
                className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-cyan-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!householdName.trim()}
                className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create household
              </button>
            </form>
          </Card>
        ) : null}

        {!loading && user && households.length ? (
          <>
            <Card
              variant="neutral"
              compact={false}
              title="Household"
              subtitle="Select the shared planning space"
              accent="#22d3ee"
              className="text-left"
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text/55" htmlFor="household-select">
                    Selected household
                  </label>
                  <select
                    id="household-select"
                    value={selectedHouseholdId}
                    onChange={(event) => setSelectedHouseholdId(event.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm text-text focus:border-cyan-400 focus:outline-none"
                  >
                    {households.map((household) => (
                      <option key={household.id} value={household.id}>
                        {household.name}
                      </option>
                    ))}
                  </select>
                  <form onSubmit={handleCreateHousehold} className="mt-3 flex gap-2">
                    <input
                      value={householdName}
                      onChange={(event) => setHouseholdName(event.target.value)}
                      placeholder="New household name"
                      className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-cyan-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!householdName.trim()}
                      className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Create
                    </button>
                  </form>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-text/55">Members</div>
                  <div className="rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-xs leading-relaxed text-text/65">
                    {(selectedHousehold?.household_members || []).length
                      ? selectedHousehold.household_members
                          .map((member) => `${ownerLabel(member.user_id, user?.id)} (${member.role})`)
                          .join(', ')
                      : 'No members visible yet.'}
                  </div>
                  {canManageMembers ? (
                    <form onSubmit={handleAddMember} className="flex gap-2">
                      <input
                        value={memberUserId}
                        onChange={(event) => setMemberUserId(event.target.value)}
                        placeholder="Member user_id"
                        className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white/70 px-3 py-2 text-sm text-text placeholder:text-text/40 focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!memberUserId.trim()}
                        className="rounded-md border border-cyan-200 bg-white/70 px-3 py-2 text-xs font-semibold text-cyan-800 shadow disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add
                      </button>
                    </form>
                  ) : (
                    <div className="text-xs text-text/55">Only a household owner can add members.</div>
                  )}
                </div>
              </div>
            </Card>

            <div className="grid gap-3 md:grid-cols-3">
              <SummaryTile label="Total move-out target" value={formatCurrency(summary.sharedExpenseTotal)} accent="text-rose-700" />
              <SummaryTile label="Total contributed" value={formatCurrency(summary.contributionTotal)} accent="text-emerald-700" />
              <SummaryTile label="Remaining needed" value={formatCurrency(summary.remainingNeeded)} accent={summary.remainingNeeded > 0 ? 'text-amber-700' : 'text-emerald-700'} />
            </div>

            <Card
              variant="neutral"
              compact={false}
              title="Mission progress"
              subtitle={`${summary.progressPercent.toFixed(1)}% funded`}
              accent="#34d399"
              className="text-left"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-3xl font-semibold text-emerald-700">{summary.progressPercent.toFixed(1)}%</div>
                  <div className="mt-1 text-sm text-text/65">
                    {formatCurrency(summary.contributionTotal)} of {formatCurrency(summary.sharedExpenseTotal)} set aside.
                  </div>
                </div>
                <div className="text-sm font-semibold text-text/65">
                  Remaining: {formatCurrency(summary.remainingNeeded)}
                </div>
              </div>
              <ProgressBar value={summary.progressPercent} />
            </Card>

            <div className="grid gap-3 lg:grid-cols-2">
              <Card
                variant="neutral"
                compact={false}
                title="Goal breakdown"
                subtitle="/sharedexpense grouped by category"
                accent="#f59e0b"
                className="text-left"
              >
                {summary.sharedExpensesByCategory.length ? (
                  <div className="space-y-2">
                    {summary.sharedExpensesByCategory.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                        <span className="font-semibold text-text">{item.label}</span>
                        <span className="text-rose-700">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm text-text/70">
                    Add shared expenses to build the target.
                  </div>
                )}
              </Card>

              <Card
                variant="neutral"
                compact={false}
                title="Contribution breakdown"
                subtitle="/contribute grouped by creator"
                accent="#34d399"
                className="text-left"
              >
                {summary.contributionsByUser.length ? (
                  <div className="space-y-2">
                    {summary.contributionsByUser.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm">
                        <span className="font-semibold text-text">{item.label}</span>
                        <span className="text-emerald-700">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm text-text/70">
                    Log contributions as money gets set aside.
                  </div>
                )}
              </Card>
            </div>

            {!events.length ? (
              <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm leading-relaxed text-text/70">
                Add shared expenses to build the target, then log contributions as money gets set aside.
              </div>
            ) : null}

            <ExampleCommands />

            <Card
              variant="neutral"
              compact={false}
              title="Recent shared logs"
              subtitle="/sharedexpense and /contribute only"
              accent="#60a5fa"
              className="text-left"
            >
              {events.length ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <article key={event.id} className="rounded-lg border border-slate-200 bg-white/70 px-3 py-3 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/40 bg-white/65 px-2 py-0.5 text-xs font-semibold text-text/75">
                            /{event.command}
                          </span>
                          <span className={isContribution(event) ? 'text-sm font-semibold text-emerald-700' : 'text-sm font-semibold text-rose-700'}>
                            {formatCurrency(event?.amounts?.amount)}
                          </span>
                        </div>
                        <time className="text-xs text-text/55" dateTime={eventTime(event)}>
                          {formatDate(eventTime(event))}
                        </time>
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-text/75">
                        <span className="text-text/55">Logged by {ownerLabel(event.owner_id, user?.id)}</span>
                      </div>
                      <div className="mt-1 text-sm leading-relaxed text-text/75">
                        {isSharedExpense(event) ? (
                          <>
                            <span className="font-semibold text-text">{event?.payload?.category || event.label}</span>
                            {event?.payload?.reason ? <span> - {event.payload.reason}</span> : null}
                          </>
                        ) : null}
                        {isContribution(event) ? (
                          <>
                            <span className="font-semibold text-text">{event?.payload?.goal || event.label}</span>
                            {event?.payload?.reason ? <span> - {event.payload.reason}</span> : null}
                          </>
                        ) : null}
                      </div>
                      {event.raw ? <div className="mt-2 text-xs text-text/45">{event.raw}</div> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white/60 px-4 py-5 text-sm leading-relaxed text-text/70">
                  Add shared expenses to build the target, then log contributions as money gets set aside.
                </div>
              )}
            </Card>
          </>
        ) : null}
      </section>
    </>
  );
}
