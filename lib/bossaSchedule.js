export const BOSSA_WEEKLY_SHIFTS_TABLE = 'bossa_weekly_shifts';

export const WEEKDAYS = [
  { day_of_week: 1, short: 'Mon', label: 'Monday' },
  { day_of_week: 2, short: 'Tue', label: 'Tuesday' },
  { day_of_week: 3, short: 'Wed', label: 'Wednesday' },
  { day_of_week: 4, short: 'Thu', label: 'Thursday' },
  { day_of_week: 5, short: 'Fri', label: 'Friday' },
  { day_of_week: 6, short: 'Sat', label: 'Saturday' },
  { day_of_week: 7, short: 'Sun', label: 'Sunday' },
];

export function dateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return dateKey(new Date());

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function currentWeekStartDate(now = new Date()) {
  const date = now instanceof Date ? new Date(now) : new Date(now);
  if (Number.isNaN(date.getTime())) return currentWeekStartDate(new Date());

  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return dateKey(date);
}

export function dateForWeekday(weekStartDate, dayOfWeek) {
  const date = new Date(`${weekStartDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + Number(dayOfWeek || 1) - 1);
  return dateKey(date);
}

export function formatShiftTime(value) {
  if (!value) return '';
  const match = String(value).match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : String(value);
}

export function formatPlannedShift(shift) {
  if (!shift) return 'Not set';
  if (shift.status === 'off') return 'Off';
  const start = formatShiftTime(shift.start_time);
  const end = formatShiftTime(shift.end_time);
  return start && end ? `${start}-${end}` : 'Scheduled';
}

export function isMissingBossaScheduleTable(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01'
    || error?.code === 'PGRST205'
    || message.includes('bossa_weekly_shifts')
    || message.includes('could not find the table')
    || message.includes('schema cache')
  );
}

export function bossaScheduleMigrationMessage() {
  return 'Bossa weekly shifts need the public.bossa_weekly_shifts table. Apply supabase/migrations/202605030003_bossa_weekly_shifts.sql.';
}

export async function saveWeeklyShiftsFromCommand(supabase, { ownerId, sourceNoteId, parsed, weekStartDate = currentWeekStartDate() }) {
  if (parsed?.command !== 'weeklyshifts' || !parsed?.valid) return null;
  if (!ownerId) throw new Error('Sign in required to save weekly shifts.');

  const shifts = parsed.payload?.shifts || [];
  if (shifts.length !== 7) throw new Error('/weeklyshifts needs exactly 7 parsed shifts.');

  const rows = shifts.map((shift) => ({
    owner_id: ownerId,
    week_start_date: weekStartDate,
    day_of_week: shift.day_of_week,
    status: shift.status,
    start_time: shift.start_time,
    end_time: shift.end_time,
    source_note_id: sourceNoteId || null,
  }));

  const { data, error } = await supabase
    .from(BOSSA_WEEKLY_SHIFTS_TABLE)
    .upsert(rows, {
      onConflict: 'owner_id,week_start_date,day_of_week',
    })
    .select('*');

  if (error) throw error;
  return data || [];
}

export function emptyWeekRows(weekStartDate = currentWeekStartDate()) {
  return WEEKDAYS.map((day) => ({
    ...day,
    date: dateForWeekday(weekStartDate, day.day_of_week),
    planned: null,
    clockin: null,
    clockout: null,
  }));
}

export function buildWeeklyShiftRows({ weekStartDate, shifts = [], clockEvents = [] }) {
  const rows = emptyWeekRows(weekStartDate);
  const byDay = new Map(rows.map((row) => [row.day_of_week, row]));

  for (const shift of shifts) {
    const row = byDay.get(shift.day_of_week);
    if (row) row.planned = shift;
  }

  for (const event of clockEvents) {
    const timestamp = event?.occurred_at || event?.created_at;
    const key = dateKey(timestamp);
    const row = rows.find((candidate) => candidate.date === key);
    if (!row) continue;

    if (event.command === 'clockin' || event.event_type === 'waitering.clockin') {
      if (!row.clockin || timestamp > (row.clockin.occurred_at || row.clockin.created_at || '')) row.clockin = event;
    }
    if (event.command === 'clockout' || event.event_type === 'waitering.clockout') {
      if (!row.clockout || timestamp > (row.clockout.occurred_at || row.clockout.created_at || '')) row.clockout = event;
    }
  }

  return rows;
}
