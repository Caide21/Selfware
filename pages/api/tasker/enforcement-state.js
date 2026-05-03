import { isMissingBossaScheduleTable } from '@/lib/bossaSchedule';
import { isMissingMaintenanceLoopEnforcementSchema } from '@/lib/maintenanceLoops';
import { isMissingPartySessionsTable } from '@/lib/partySessions';
import { requireUser } from '@/lib/supabaseServer';

const LOCAL_TIME_ZONE = process.env.SELFWARE_LOCAL_TIME_ZONE || 'Africa/Johannesburg';
const CHECK_EVERY_MINUTES = 30;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function localParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: LOCAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const get = (type) => parts.find((part) => part.type === type)?.value;
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
  };
}

function dateKeyFromParts(parts) {
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

function addDays(dateKey, amount) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function dayOfWeekMondayOne(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = date.getUTCDay();
  return dayIndex === 0 ? 7 : dayIndex;
}

function weekStartDate(dateKey) {
  return addDays(dateKey, 1 - dayOfWeekMondayOne(dateKey));
}

function normalizeTime(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

function minutesFromTime(time) {
  const match = String(time || '').match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function timeFromMinutes(minutes) {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(normalized / 60))}:${pad2(normalized % 60)}`;
}

function compactShiftLabel(start, end) {
  const startMinutes = minutesFromTime(start);
  const endMinutes = minutesFromTime(end);
  if (startMinutes == null || endMinutes == null) return start && end ? `${start}-${end}` : 'Scheduled';

  const toHourLabel = (minutes) => {
    const hour = Math.floor(minutes / 60);
    const displayHour = hour > 12 ? hour - 12 : hour;
    return String(displayHour || 12);
  };

  return `${toHourLabel(startMinutes)}-${toHourLabel(endMinutes)}`;
}

function isMissingOptionalTable(error) {
  return isMissingMaintenanceLoopEnforcementSchema(error);
}

function cycleState(now = new Date()) {
  const parts = localParts(now);
  const localDate = dateKeyFromParts(parts);
  const shutdownDate = parts.hour < 6 ? addDays(localDate, -1) : localDate;
  const shiftDate = parts.hour >= 12 ? addDays(shutdownDate, 1) : localDate;
  const cycleMinutes = parts.hour < 6
    ? (parts.hour + 24) * 60 + parts.minute
    : parts.hour * 60 + parts.minute;

  return {
    localDate,
    shutdownDate,
    shiftDate,
    cycleMinutes,
  };
}

async function loadShift(supabase, { ownerId, shiftDate }) {
  const dayOfWeek = dayOfWeekMondayOne(shiftDate);
  const { data, error } = await supabase
    .from('bossa_weekly_shifts')
    .select('id, week_start_date, day_of_week, status, start_time, end_time')
    .eq('owner_id', ownerId)
    .eq('week_start_date', weekStartDate(shiftDate))
    .eq('day_of_week', dayOfWeek)
    .limit(1);

  if (error) throw error;

  const shift = data?.[0] || null;
  const start = normalizeTime(shift?.start_time);
  const end = normalizeTime(shift?.end_time);
  const hasShift = shift?.status === 'scheduled' && !!start;
  const startMinutes = minutesFromTime(start);

  if (!hasShift) {
    return {
      hasShift: false,
      dayOfWeek,
      label: null,
      start: null,
      end: null,
      isEarlyShift: false,
      alarmAt: null,
    };
  }

  return {
    hasShift: true,
    dayOfWeek,
    label: compactShiftLabel(start, end),
    start,
    end,
    isEarlyShift: start === '08:00',
    alarmAt: startMinutes == null ? null : timeFromMinutes(startMinutes - 60),
  };
}

async function loadMaintenance(supabase, { ownerId, shutdownDate, localDate }) {
  const { data: loops, error: loopsError } = await supabase
    .from('maintenance_loops')
    .select('id, title, status, cadence')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .eq('cadence', 'daily')
    .order('due_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (loopsError) {
    if (isMissingOptionalTable(loopsError)) {
      return {
        status: 'unavailable',
        allCompleted: false,
        incompleteCount: 0,
        incompleteLoops: [],
      };
    }
    throw loopsError;
  }

  const loopIds = (loops || []).map((loop) => loop.id);
  if (!loopIds.length) {
    return {
      status: 'available',
      allCompleted: true,
      incompleteCount: 0,
      incompleteLoops: [],
    };
  }

  const completionDates = Array.from(new Set([shutdownDate, localDate]));
  const { data: completions, error: completionsError } = await supabase
    .from('maintenance_completions')
    .select('loop_id, completed_on')
    .eq('owner_id', ownerId)
    .in('loop_id', loopIds)
    .in('completed_on', completionDates);

  if (completionsError) {
    if (isMissingOptionalTable(completionsError)) {
      return {
        status: 'unavailable',
        allCompleted: false,
        incompleteCount: 0,
        incompleteLoops: [],
      };
    }
    throw completionsError;
  }

  const completedLoopIds = new Set((completions || []).map((completion) => completion.loop_id));
  const incompleteLoops = (loops || [])
    .filter((loop) => !completedLoopIds.has(loop.id))
    .map((loop) => ({
      id: loop.id,
      title: loop.title,
    }));

  return {
    status: 'available',
    allCompleted: incompleteLoops.length === 0,
    incompleteCount: incompleteLoops.length,
    incompleteLoops,
  };
}

async function loadPartyTime(supabase, { ownerId }) {
  const { data, error } = await supabase
    .from('party_sessions')
    .select('id, started_at')
    .eq('owner_id', ownerId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  const session = data?.[0] || null;
  return {
    active: !!session,
    startedAt: session?.started_at || null,
  };
}

function buildEnforcement({ maintenance, shift, partytime, cycleMinutes }) {
  if (maintenance.status === 'unavailable') {
    return {
      shouldWarn: false,
      shouldSpamAlarm: false,
      checkEveryMinutes: CHECK_EVERY_MINUTES,
      reason: 'Maintenance tables are unavailable, so enforcement is disabled.',
    };
  }

  if (maintenance.allCompleted) {
    return {
      shouldWarn: false,
      shouldSpamAlarm: false,
      checkEveryMinutes: CHECK_EVERY_MINUTES,
      reason: 'Maintenance loops complete.',
    };
  }

  const warningStart = shift.isEarlyShift ? 20 * 60 : 23 * 60;
  const hardDeadline = partytime.active
    ? 29 * 60
    : shift.isEarlyShift
      ? 25 * 60
      : 27 * 60;

  const shouldSpamAlarm = cycleMinutes >= hardDeadline && cycleMinutes < 30 * 60;
  const shouldWarn = !shouldSpamAlarm && cycleMinutes >= warningStart && cycleMinutes < hardDeadline;

  if (shouldSpamAlarm) {
    return {
      shouldWarn: false,
      shouldSpamAlarm: true,
      checkEveryMinutes: CHECK_EVERY_MINUTES,
      reason: partytime.active
        ? 'Party Time is active and maintenance loops are incomplete after the 05:00 deadline.'
        : 'Maintenance loops incomplete and hard alarm deadline passed.',
    };
  }

  if (shouldWarn) {
    return {
      shouldWarn: true,
      shouldSpamAlarm: false,
      checkEveryMinutes: CHECK_EVERY_MINUTES,
      reason: 'Maintenance loops incomplete, warning window active.',
    };
  }

  return {
    shouldWarn: false,
    shouldSpamAlarm: false,
    checkEveryMinutes: CHECK_EVERY_MINUTES,
    reason: 'Maintenance loops incomplete, but enforcement window is not active yet.',
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const now = new Date();
    const cycle = cycleState(now);

    const [shift, maintenance, partytime] = await Promise.all([
      loadShift(supabase, { ownerId: user.id, shiftDate: cycle.shiftDate }),
      loadMaintenance(supabase, {
        ownerId: user.id,
        shutdownDate: cycle.shutdownDate,
        localDate: cycle.localDate,
      }),
      loadPartyTime(supabase, { ownerId: user.id }),
    ]);

    return res.status(200).json({
      ok: true,
      now: now.toISOString(),
      shift,
      maintenance,
      partytime,
      enforcement: buildEnforcement({
        maintenance,
        shift,
        partytime,
        cycleMinutes: cycle.cycleMinutes,
      }),
    });
  } catch (error) {
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    if (isMissingBossaScheduleTable(error)) {
      return res.status(501).json({
        ok: false,
        error: 'Tasker enforcement requires public.bossa_weekly_shifts.',
      });
    }

    if (isMissingPartySessionsTable(error)) {
      return res.status(501).json({
        ok: false,
        error: 'Tasker enforcement requires public.party_sessions.',
      });
    }

    console.error('[tasker/enforcement-state] failed', error);
    return res.status(500).json({ ok: false, error: 'Could not load Tasker enforcement state.' });
  }
}
