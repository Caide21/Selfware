export const MAINTENANCE_LOOPS_TABLE = 'maintenance_loops';
export const MAINTENANCE_COMPLETIONS_TABLE = 'maintenance_completions';

export function normalizeMaintenanceLoopTitle(title) {
  return String(title || '').trim().replace(/\s+/g, ' ');
}

export function normalizeMaintenanceLoopTitleKey(title) {
  return normalizeMaintenanceLoopTitle(title).toLowerCase();
}

export function isMissingMaintenanceLoopsTable(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01'
    || error?.code === 'PGRST205'
    || message.includes('could not find the table')
    || message.includes('does not exist')
    || message.includes('schema cache')
  );
}

export function maintenanceLoopsMigrationMessage() {
  return 'Maintenance Loops needs the public.maintenance_loops migration. Apply supabase/migrations/202605030001_maintenance_loops.sql and supabase/migrations/202605030002_maintenance_loop_enforcement.sql.';
}

export function maintenanceLoopEnforcementMigrationMessage() {
  return 'Maintenance Loops enforcement needs cadence/due_time on public.maintenance_loops and the public.maintenance_completions table. Apply supabase/migrations/202605030002_maintenance_loop_enforcement.sql.';
}

export function isMissingMaintenanceLoopEnforcementSchema(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    isMissingMaintenanceLoopsTable(error)
    || error?.code === '42703'
    || message.includes('maintenance_completions')
    || message.includes('cadence')
    || message.includes('due_time')
    || message.includes('completed_on')
    || message.includes('source_note_id')
  );
}

export function todayDateKey(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return todayDateKey(new Date());

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function currentTimeKey(now = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return currentTimeKey(new Date());

  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function normalizeDueTime(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

export function isLoopDueNow(loop, now = new Date()) {
  if (loop?.status !== 'active') return false;
  if (loop?.cadence !== 'daily') return false;

  const dueTime = normalizeDueTime(loop.due_time);
  if (!dueTime) return false;

  return dueTime <= currentTimeKey(now);
}

export function loopStatusForToday(loop, completedLoopIds, now = new Date()) {
  if (completedLoopIds.has(loop.id)) return 'done_today';
  return isLoopDueNow(loop, now) ? 'overdue' : 'pending';
}

export async function listOverdueMaintenanceLoops(supabase, { ownerId, now = new Date() }) {
  if (!ownerId) throw new Error('Sign in required to check maintenance loops.');

  const today = todayDateKey(now);
  const { data: loops, error: loopsError } = await supabase
    .from(MAINTENANCE_LOOPS_TABLE)
    .select('id,title,due_time,status,cadence')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .eq('cadence', 'daily')
    .order('due_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (loopsError) throw loopsError;

  const dueLoops = (loops || []).filter((loop) => isLoopDueNow(loop, now));
  if (!dueLoops.length) return [];

  const loopIds = dueLoops.map((loop) => loop.id);
  const { data: completions, error: completionsError } = await supabase
    .from(MAINTENANCE_COMPLETIONS_TABLE)
    .select('loop_id')
    .eq('owner_id', ownerId)
    .eq('completed_on', today)
    .in('loop_id', loopIds);

  if (completionsError) throw completionsError;

  const completedLoopIds = new Set((completions || []).map((completion) => completion.loop_id));
  return dueLoops
    .filter((loop) => !completedLoopIds.has(loop.id))
    .map((loop) => ({
      id: loop.id,
      title: loop.title,
      due_time: normalizeDueTime(loop.due_time),
      status: 'overdue',
    }));
}

export async function findActiveMaintenanceLoopByTitle(supabase, { ownerId, title }) {
  const normalizedTitle = normalizeMaintenanceLoopTitle(title);
  const normalizedKey = normalizeMaintenanceLoopTitleKey(title);
  if (!ownerId) throw new Error('Sign in required to find maintenance loops.');
  if (!normalizedTitle) throw new Error('Maintenance loops need a title.');

  const { data, error } = await supabase
    .from(MAINTENANCE_LOOPS_TABLE)
    .select('*')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .ilike('title', normalizedTitle)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return (data || []).find((loop) => normalizeMaintenanceLoopTitleKey(loop.title) === normalizedKey) || null;
}

export async function completeMaintenanceLoop(supabase, { ownerId, id, title, now = new Date(), source = 'api', sourceNoteId = null }) {
  if (!ownerId) throw new Error('Sign in required to complete maintenance loops.');

  const normalizedTitle = normalizeMaintenanceLoopTitle(title);
  if (!id && !normalizedTitle) {
    const error = new Error('Provide a loop id or title.');
    error.statusCode = 400;
    throw error;
  }

  let loop = null;

  if (id) {
    const { data: matches, error: loopError } = await supabase
      .from(MAINTENANCE_LOOPS_TABLE)
      .select('id,title,status')
      .eq('owner_id', ownerId)
      .eq('status', 'active')
      .eq('id', id)
      .limit(1);

    if (loopError) throw loopError;
    loop = matches?.[0] || null;
  } else {
    loop = await findActiveMaintenanceLoopByTitle(supabase, { ownerId, title: normalizedTitle });
  }

  if (!loop?.id) {
    const error = new Error(normalizedTitle ? `No active maintenance loop found called "${normalizedTitle}".` : 'Active maintenance loop not found.');
    error.statusCode = 404;
    throw error;
  }

  const completionPayload = {
    owner_id: ownerId,
    loop_id: loop.id,
    completed_on: todayDateKey(now),
    completed_at: now.toISOString(),
    source,
    source_note_id: sourceNoteId || null,
  };

  const { data: completion, error: completionError } = await supabase
    .from(MAINTENANCE_COMPLETIONS_TABLE)
    .upsert(completionPayload, {
      onConflict: 'owner_id,loop_id,completed_on',
    })
    .select('*')
    .single();

  if (completionError) throw completionError;

  return { loop, completion };
}

export async function createMaintenanceLoop(supabase, { ownerId, title, category = null }) {
  const normalizedTitle = normalizeMaintenanceLoopTitle(title);
  if (!ownerId) throw new Error('Sign in required to create maintenance loops.');
  if (!normalizedTitle) throw new Error('Maintenance loops need a title.');

  const existingLoop = await findActiveMaintenanceLoopByTitle(supabase, { ownerId, title: normalizedTitle });
  if (existingLoop?.id) {
    return {
      loop: existingLoop,
      created: false,
      message: `Maintenance loop already active: ${existingLoop.title}.`,
    };
  }

  const { data, error } = await supabase
    .from(MAINTENANCE_LOOPS_TABLE)
    .insert({
      owner_id: ownerId,
      title: normalizedTitle,
      category,
      status: 'active',
      cadence: 'daily',
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const duplicateLoop = await findActiveMaintenanceLoopByTitle(supabase, { ownerId, title: normalizedTitle });
      if (duplicateLoop?.id) {
        return {
          loop: duplicateLoop,
          created: false,
          message: `Maintenance loop already active: ${duplicateLoop.title}.`,
        };
      }
    }
    throw error;
  }
  return {
    loop: data,
    created: true,
    message: `Maintenance loop added: ${data.title}. Signal restored.`,
  };
}

export async function archiveMaintenanceLoopByTitle(supabase, { ownerId, title }) {
  const normalizedTitle = normalizeMaintenanceLoopTitle(title);
  if (!ownerId) throw new Error('Sign in required to remove maintenance loops.');
  if (!normalizedTitle) throw new Error('Maintenance loops need a title.');

  const loop = await findActiveMaintenanceLoopByTitle(supabase, { ownerId, title: normalizedTitle });
  if (!loop?.id) {
    throw new Error(`No active maintenance loop found called "${normalizedTitle}".`);
  }

  const { data, error: updateError } = await supabase
    .from(MAINTENANCE_LOOPS_TABLE)
    .update({ status: 'archived' })
    .eq('id', loop.id)
    .eq('owner_id', ownerId)
    .select('*')
    .single();

  if (updateError) throw updateError;
  return data;
}

export async function listMaintenanceLoopStates(supabase, { ownerId, now = new Date() }) {
  if (!ownerId) throw new Error('Sign in required to load maintenance loops.');

  const today = todayDateKey(now);
  const { data: loops, error: loopsError } = await supabase
    .from(MAINTENANCE_LOOPS_TABLE)
    .select('id,title,category,status,cadence,due_time,created_at,updated_at')
    .eq('owner_id', ownerId)
    .eq('status', 'active')
    .order('due_time', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (loopsError) throw loopsError;

  const loopIds = (loops || []).map((loop) => loop.id);
  if (!loopIds.length) return [];

  const { data: completions, error: completionsError } = await supabase
    .from(MAINTENANCE_COMPLETIONS_TABLE)
    .select('loop_id, completed_on, completed_at')
    .eq('owner_id', ownerId)
    .in('loop_id', loopIds)
    .order('completed_at', { ascending: false });

  if (completionsError) throw completionsError;

  const completedTodayIds = new Set(
    (completions || [])
      .filter((completion) => completion.completed_on === today)
      .map((completion) => completion.loop_id)
  );
  const latestByLoopId = new Map();

  for (const completion of completions || []) {
    if (!latestByLoopId.has(completion.loop_id)) {
      latestByLoopId.set(completion.loop_id, completion.completed_at);
    }
  }

  return (loops || []).map((loop) => ({
    ...loop,
    due_time: normalizeDueTime(loop.due_time),
    completionState: loopStatusForToday(loop, completedTodayIds, now),
    lastCompletedAt: latestByLoopId.get(loop.id) || null,
  }));
}

export async function listDueMaintenanceLoops(supabase, { ownerId, now = new Date() }) {
  const states = await listMaintenanceLoopStates(supabase, { ownerId, now });
  return states
    .filter((loop) => loop.cadence === 'daily' && loop.completionState !== 'done_today')
    .map((loop) => ({
      id: loop.id,
      title: loop.title,
      due_time: loop.due_time,
      status: loop.completionState,
    }));
}

export async function applyRoutineCommand(supabase, { parsed, ownerId, sourceNoteId = null }) {
  if (parsed?.command !== 'routine' || !parsed?.valid) return null;

  const action = parsed.payload?.action;
  const title = parsed.payload?.title || parsed.label;

  if (action === 'add') {
    const result = await createMaintenanceLoop(supabase, { ownerId, title });
    return {
      action,
      loop: result.loop,
      created: result.created,
      message: result.message,
    };
  }

  if (action === 'done') {
    const result = await completeMaintenanceLoop(supabase, {
      ownerId,
      title,
      source: 'note',
      sourceNoteId,
    });
    return {
      action,
      loop: result.loop,
      completion: result.completion,
      message: `Maintenance loop completed: ${result.loop.title}.`,
    };
  }

  if (action === 'remove') {
    const loop = await archiveMaintenanceLoopByTitle(supabase, { ownerId, title });
    return {
      action,
      loop,
      message: `Maintenance loop archived: ${loop.title}.`,
    };
  }

  if (action === 'due') {
    const dueLoops = await listDueMaintenanceLoops(supabase, { ownerId });
    return {
      action,
      loops: dueLoops,
      message: dueLoops.length
        ? `Due maintenance loops: ${dueLoops.map((loop) => loop.title).join(', ')}.`
        : 'No maintenance loops due right now. The board is clean.',
    };
  }

  throw new Error('/routine needs add, done, remove, or due.');
}
