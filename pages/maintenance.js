import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import Card from '@/components/CardKit/Card';
import GhostButton from '@/components/ui/GhostButton';
import { usePageHeading } from '@/components/Layout/PageShell';
import {
  isMissingMaintenanceLoopEnforcementSchema,
  listMaintenanceLoopStates,
  maintenanceLoopEnforcementMigrationMessage,
} from '@/lib/maintenanceLoops';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Maintenance Loops',
  subtitle: 'Recurring responsibilities that keep life stable.',
};

function formatLoopTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function stateLabel(state) {
  if (state === 'done_today') return 'Done today';
  if (state === 'overdue') return 'Overdue';
  return 'Pending';
}

function stateClassName(state) {
  if (state === 'done_today') return 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100';
  if (state === 'overdue') return 'border-red-300/25 bg-red-500/10 text-red-100';
  return 'border-amber-300/25 bg-amber-500/10 text-amber-100';
}

export default function MaintenancePage() {
  const [user, setUser] = useState(null);
  const [loops, setLoops] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [loopsLoading, setLoopsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [migrationRequired, setMigrationRequired] = useState(false);

  usePageHeading(PAGE_HEADING);

  const fetchLoops = useCallback(async (ownerId) => {
    setLoopsLoading(true);
    setError(null);
    setMigrationRequired(false);

    try {
      const data = await listMaintenanceLoopStates(supabase, { ownerId });
      setLoops(data);
    } catch (fetchError) {
      console.error('Failed to fetch maintenance loops', fetchError);
      if (isMissingMaintenanceLoopEnforcementSchema(fetchError)) {
        setMigrationRequired(true);
        setError(maintenanceLoopEnforcementMigrationMessage());
      } else {
        setError('Could not load maintenance loops. Small chaos detected.');
      }
      setLoops([]);
    } finally {
      setLoopsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setAuthLoading(true);
      setError(null);
      setMigrationRequired(false);

      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (cancelled) return;

        const resolvedUser = data?.user ?? null;
        setUser(resolvedUser);

        if (resolvedUser?.id) {
          await fetchLoops(resolvedUser.id);
        } else {
          setLoops([]);
        }
      } catch (authError) {
        console.error('Failed to resolve user for maintenance loops', authError);
        if (!cancelled) {
          setUser(null);
          setLoops([]);
          setError('Could not check sign-in state.');
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [fetchLoops]);

  const showSignInRequired = !authLoading && !user;
  const showEmpty = !authLoading && !loopsLoading && user && !error && loops.length === 0;

  return (
    <>
      <Head>
        <title>Maintenance Loops</title>
      </Head>

      <section className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl text-sm leading-relaxed text-text/65">
            Add, complete, query, or archive daily maintenance loops from Notes. Tasker reads this same state for enforcement.
          </div>
          <GhostButton href="/notes" className="self-start sm:self-auto">
            Open Notes
          </GhostButton>
        </div>

        {authLoading || loopsLoading ? (
          <div className="text-sm text-text/55">Loading maintenance loops...</div>
        ) : null}

        {error ? (
          <div
            className={[
              'rounded-md border px-3 py-2 text-sm',
              migrationRequired
                ? 'border-amber-300/25 bg-amber-500/10 text-amber-100'
                : 'border-red-400/25 bg-red-500/10 text-red-100',
            ].join(' ')}
          >
            {error}
          </div>
        ) : null}

        {showSignInRequired ? (
          <div className="text-sm text-text/60">Sign in required. Maintenance loops need an owner before they can land.</div>
        ) : null}

        {showEmpty ? (
          <Card title="No loops yet" variant="neutral" accent="#94a3b8" className="text-left">
            <p className="mt-2 text-sm text-text/70">
              No loops yet. Add one from Notes with /routine add Lock doors.
            </p>
          </Card>
        ) : null}

        {loops.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loops.map((loop) => {
              const createdAt = formatLoopTimestamp(loop.created_at);
              const lastCompletedAt = formatLoopTimestamp(loop.lastCompletedAt);
              const dueTime = loop.due_time || null;

              return (
                <Card
                  key={loop.id}
                  title={loop.title}
                  subtitle={loop.category || loop.cadence || 'Daily loop'}
                  variant="neutral"
                  accent={loop.completionState === 'done_today' ? '#34d399' : loop.completionState === 'overdue' ? '#fb7185' : '#f59e0b'}
                  className="h-full text-left [&_h3]:text-base"
                >
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text/50">
                    <span className={['rounded-full border px-2 py-1', stateClassName(loop.completionState)].join(' ')}>
                      {stateLabel(loop.completionState)}
                    </span>
                    {dueTime ? <span>Due {dueTime}</span> : <span>No due time</span>}
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-text/55">
                    {lastCompletedAt ? <div>Last completed: {lastCompletedAt}</div> : <div>Last completed: Not yet</div>}
                    {createdAt ? <div>Added: {createdAt}</div> : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>
    </>
  );
}
