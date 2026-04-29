// src/app/habits/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import HabitCard from '@/components/CardKit/cards/HabitCard';
import { supabase } from '@/lib/supabaseClient';
import { createHabit, type HabitPayload, type HabitPolarity, type HabitRow } from '@/components/Habits';

const PAGE_HEADING = {
  emoji: '',
  title: 'Habits',
  subtitle: 'Track the loops that run your day: good, bad, and neutral.',
};

type HabitStatus = 'active' | 'inactive' | string;

interface HabitMeta {
  id: string;
  isNew: boolean;
  polarity?: HabitPolarity | null;
}

function mapHabitRowToCard(habit: HabitRow = {} as HabitRow) {
  return {
    id: habit.id,
    title: habit.title ?? '',
    description: habit.description ?? '',
    cadence: habit.cadence ?? '',
    streak: habit.streak ?? 0,
    status: (habit.status ?? 'active') as HabitStatus,
    xp_value: habit.xp_value ?? 0,
    polarity: (habit.polarity ?? 'good') as HabitPolarity,
  };
}

function groupByPolarity(habits: HabitRow[] = []) {
  const groups: Record<HabitPolarity, HabitRow[]> = {
    good: [],
    bad: [],
    neutral: [],
  };

  for (const habit of habits) {
    const p = (habit.polarity ?? 'good') as HabitPolarity;
    groups[p].push(habit);
  }

  return groups;
}

function createBlankHabit(polarity: HabitPolarity = 'good'): HabitRow {
  const tempId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(16).slice(2);

  return {
    id: `temp-${tempId}`,
    title: '',
    description: '',
    cadence: '',
    streak: 0,
    status: 'active',
    xp_value: 0,
    polarity,
    isNew: true,
  };
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<HabitRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) {
          if (active) {
            setUserId(null);
            setHabits([]);
          }
          return;
        }

        if (active) {
          setUserId(user.id);
        }

        const { data, error } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (active) {
          setHabits((data || []) as HabitRow[]);
        }
      } catch (e: unknown) {
        const err = e as { message?: string };
        if (active) {
          setLoadError(err?.message || 'Failed to load habits');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function handleAddHabit(polarity: HabitPolarity = 'good') {
    setHabits(prev => [...prev, createBlankHabit(polarity)]);
  }

  const grouped = useMemo(() => groupByPolarity(habits), [habits]);
  const { good, bad, neutral } = grouped;

  async function handleSaveHabit(payload: HabitPayload, meta: HabitMeta) {
    const { isNew, id, polarity } = meta;
    setActionError(null);

    try {
      if (isNew) {
        // createHabit is your existing helper
        const row = (await createHabit(payload, polarity || 'good')) as HabitRow;
        setHabits(prev => prev.map(h => (h.id === id ? row : h)));
      } else {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error('Not signed in');

        const { data, error } = await supabase
          .from('habits')
          .update(payload)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single<HabitRow>();

        if (error) throw error;
        if (data) {
          setHabits(prev => prev.map(h => (h.id === id ? data : h)));
        }
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      setActionError(err?.message || 'Save failed');
    }
  }

  function handleDiscardHabit(id: string) {
    setHabits(prev => prev.filter(h => h.id !== id));
  }

  const renderColumn = (
    label: string,
    polarityKey: HabitPolarity,
    list: HabitRow[],
  ) => (
    <div className="flex-1 space-y-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </h2>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          onClick={() => handleAddHabit(polarityKey)}
        >
          Add habit
        </button>
      </div>

      <div className="space-y-3">
        {list.map(habit => (
          <HabitCard
            key={habit.id}
            habit={mapHabitRowToCard(habit)}
            isNew={Boolean(habit.isNew)}
            onSaved={(payload: HabitPayload, meta: HabitMeta) =>
              handleSaveHabit(payload, {
                ...meta,
                id: habit.id,
                polarity: (habit.polarity || polarityKey) as HabitPolarity,
              })
            }
            onDiscard={() => handleDiscardHabit(habit.id)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Habits</h1>
        <p className="mt-1 text-slate-600">
          Track the loops that run your day: good, bad, and neutral.
        </p>
      </div>

      {loading && (
        <div className="text-sm text-slate-500">Loading habits...</div>
      )}
      {!loading && !loadError && !userId && (
        <div className="text-sm text-slate-500">Sign in required to manage habits.</div>
      )}
      {loadError && (
        <div className="text-sm text-rose-600">Error: {loadError}</div>
      )}

      {!loading && !loadError && userId && (
        <div className="grid gap-6 md:grid-cols-3">
          {renderColumn('Good habits', 'good', good)}
          {renderColumn('Bad habits', 'bad', bad)}
          {renderColumn('Neutral habits', 'neutral', neutral)}
        </div>
      )}

      {actionError && (
        <div className="mt-4 max-w-3xl rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {actionError}
        </div>
      )}
    </div>
  );
}
