import { requireAdminAccess } from '@/lib/auth/adminAccess';
import { parseNoteCommand } from '@/lib/parseNoteCommand';
import { getServiceClient, requireUser } from '@/lib/supabaseServer';

const MAX_ITEMS_PER_CHECK = 25;
const MAX_IDS_PER_ITEM = 12;
const LOCAL_TIME_ZONE = process.env.SELFWARE_LOCAL_TIME_ZONE || 'Africa/Johannesburg';

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function previewText(value, maxLength = 140) {
  const compact = String(value || '').trim().replace(/\s+/g, ' ');
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1)}...`;
}

function toLocalDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'unknown';

  const parts = new Intl.DateTimeFormat('en', {
    timeZone: LOCAL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return year && month && day ? `${year}-${month}-${day}` : 'unknown';
}

function isMissingTableError(error) {
  const message = String(error?.message || error?.details || '').toLowerCase();
  return error?.code === '42P01'
    || error?.code === 'PGRST205'
    || message.includes('could not find the table')
    || message.includes('relation') && message.includes('does not exist');
}

function createCheck({ key, label, items = [] }) {
  return {
    key,
    label,
    status: items.length ? 'found' : 'ok',
    count: items.length,
    items: items.slice(0, MAX_ITEMS_PER_CHECK),
  };
}

function createErrorCheck(key, label, error) {
  return {
    key,
    label,
    status: 'error',
    count: 0,
    reason: error?.message || 'Check failed.',
  };
}

function createSkippedCheck(key, label, reason) {
  return {
    key,
    label,
    status: 'skipped',
    reason,
  };
}

function groupDuplicateNotes(notes, { commandsOnly = false } = {}) {
  const groups = new Map();

  for (const note of notes) {
    const content = String(note?.content || '');
    if (commandsOnly && !content.trimStart().startsWith('/')) continue;

    const normalized = normalizeText(content);
    if (!normalized) continue;

    const groupKey = `${note.owner_id || 'unknown'}::${normalized}`;
    const current = groups.get(groupKey) || {
      pattern: normalized,
      ownerId: note.owner_id || null,
      count: 0,
      ids: [],
      preview: previewText(content),
      firstSeenAt: note.created_at || null,
      latestSeenAt: note.created_at || null,
    };

    current.count += 1;
    if (current.ids.length < MAX_IDS_PER_ITEM) current.ids.push(note.id);
    if (note.created_at && (!current.firstSeenAt || note.created_at < current.firstSeenAt)) current.firstSeenAt = note.created_at;
    if (note.created_at && (!current.latestSeenAt || note.created_at > current.latestSeenAt)) current.latestSeenAt = note.created_at;
    groups.set(groupKey, current);
  }

  return Array.from(groups.values())
    .filter((group) => group.count > 1)
    .sort((a, b) => b.count - a.count || String(a.preview).localeCompare(String(b.preview)));
}

function groupParsedCommandDuplicates(notes, command, keyBuilder, patternBuilder) {
  const groups = new Map();

  for (const note of notes) {
    const parsed = parseNoteCommand(note?.content);
    if (!parsed?.valid || parsed.command !== command) continue;

    const localDate = toLocalDate(note.created_at);
    const commandKey = keyBuilder(parsed);
    if (!commandKey) continue;

    const groupKey = `${note.owner_id || 'unknown'}::${localDate}::${commandKey}`;
    const current = groups.get(groupKey) || {
      pattern: patternBuilder(parsed, localDate),
      ownerId: note.owner_id || null,
      localDate,
      count: 0,
      ids: [],
      preview: previewText(note.content),
      firstSeenAt: note.created_at || null,
      latestSeenAt: note.created_at || null,
    };

    current.count += 1;
    if (current.ids.length < MAX_IDS_PER_ITEM) current.ids.push(note.id);
    if (note.created_at && (!current.firstSeenAt || note.created_at < current.firstSeenAt)) current.firstSeenAt = note.created_at;
    if (note.created_at && (!current.latestSeenAt || note.created_at > current.latestSeenAt)) current.latestSeenAt = note.created_at;
    groups.set(groupKey, current);
  }

  return Array.from(groups.values())
    .filter((group) => group.count > 1)
    .sort((a, b) => String(b.latestSeenAt || '').localeCompare(String(a.latestSeenAt || '')));
}

function findOpenClockEvents(notes) {
  const byOwner = new Map();

  for (const note of notes) {
    const parsed = parseNoteCommand(note?.content);
    if (!parsed?.valid || !['clockin', 'clockout'].includes(parsed.command)) continue;

    const ownerId = note.owner_id || 'unknown';
    const events = byOwner.get(ownerId) || [];
    events.push({
      id: note.id,
      ownerId: note.owner_id || null,
      command: parsed.command,
      createdAt: note.created_at || null,
      localDate: toLocalDate(note.created_at),
      preview: previewText(note.content),
    });
    byOwner.set(ownerId, events);
  }

  const openEvents = [];
  for (const events of byOwner.values()) {
    const sorted = events.sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
    let pendingClockIn = null;

    for (const event of sorted) {
      if (event.command === 'clockin') {
        if (pendingClockIn) openEvents.push(pendingClockIn);
        pendingClockIn = event;
        continue;
      }

      if (event.command === 'clockout' && pendingClockIn) {
        pendingClockIn = null;
      }
    }

    if (pendingClockIn) openEvents.push(pendingClockIn);
  }

  return openEvents
    .map((event) => ({
      pattern: `${event.localDate} open clock event`,
      ownerId: event.ownerId,
      count: 1,
      ids: [event.id],
      preview: event.preview,
      localDate: event.localDate,
      firstSeenAt: event.createdAt,
      latestSeenAt: event.createdAt,
    }))
    .sort((a, b) => String(b.firstSeenAt || '').localeCompare(String(a.firstSeenAt || '')));
}

function groupTableRows(rows, { tableName, label, keyBuilder, patternBuilder }) {
  const groups = new Map();

  for (const row of rows || []) {
    const duplicateKey = keyBuilder(row);
    if (!duplicateKey) continue;

    const groupKey = `${row.owner_id || 'unknown'}::${duplicateKey}`;
    const current = groups.get(groupKey) || {
      pattern: patternBuilder(row),
      ownerId: row.owner_id || null,
      count: 0,
      ids: [],
      preview: patternBuilder(row),
      firstSeenAt: row.created_at || null,
      latestSeenAt: row.created_at || null,
    };

    current.count += 1;
    if (current.ids.length < MAX_IDS_PER_ITEM) current.ids.push(row.id);
    if (row.created_at && (!current.firstSeenAt || row.created_at < current.firstSeenAt)) current.firstSeenAt = row.created_at;
    if (row.created_at && (!current.latestSeenAt || row.created_at > current.latestSeenAt)) current.latestSeenAt = row.created_at;
    groups.set(groupKey, current);
  }

  return createCheck({
    key: tableName,
    label,
    items: Array.from(groups.values())
      .filter((group) => group.count > 1)
      .sort((a, b) => b.count - a.count || String(a.pattern).localeCompare(String(b.pattern))),
  });
}

async function runOptionalTableCheck(serviceClient, { tableName, label, select, keyBuilder, patternBuilder }) {
  const { data, error } = await serviceClient.from(tableName).select(select).limit(5000);

  if (error) {
    if (isMissingTableError(error)) {
      return createSkippedCheck(tableName, label, `Table ${tableName} does not exist yet.`);
    }
    return createErrorCheck(tableName, label, error);
  }

  return groupTableRows(data, { tableName, label, keyBuilder, patternBuilder });
}

async function runScanner(serviceClient) {
  const checks = [];
  const { data: notes, error: notesError } = await serviceClient
    .from('notes')
    .select('id, owner_id, content, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  if (notesError) {
    checks.push(createErrorCheck('duplicate_notes', 'Duplicate Notes', notesError));
    checks.push(createErrorCheck('duplicate_command_notes', 'Duplicate Command Notes', notesError));
    checks.push(createErrorCheck('duplicate_table_entries', 'Duplicate /table Entries', notesError));
    checks.push(createErrorCheck('duplicate_cashup_entries', 'Duplicate /cashup Entries', notesError));
    checks.push(createErrorCheck('open_clock_events', 'Open Clock Events', notesError));
  } else {
    checks.push(createCheck({
      key: 'duplicate_notes',
      label: 'Duplicate Notes',
      items: groupDuplicateNotes(notes || []),
    }));

    checks.push(createCheck({
      key: 'duplicate_command_notes',
      label: 'Duplicate Command Notes',
      items: groupDuplicateNotes(notes || [], { commandsOnly: true }),
    }));

    checks.push(createCheck({
      key: 'duplicate_table_entries',
      label: 'Duplicate /table Entries',
      items: groupParsedCommandDuplicates(
        notes || [],
        'table',
        (parsed) => `${parsed.payload?.tableNumber}|${parsed.amounts?.billTotal}|${parsed.amounts?.amountTendered}`,
        (parsed, localDate) => `Table ${parsed.payload?.tableNumber}, bill ${parsed.amounts?.billTotal}, tendered ${parsed.amounts?.amountTendered} on ${localDate}`
      ),
    }));

    checks.push(createCheck({
      key: 'duplicate_cashup_entries',
      label: 'Duplicate /cashup Entries',
      items: groupParsedCommandDuplicates(
        notes || [],
        'cashup',
        (parsed) => `${parsed.amounts?.turnover}|${parsed.amounts?.retained}|${parsed.amounts?.cash}`,
        (parsed, localDate) => `Cashup ${parsed.amounts?.turnover}/${parsed.amounts?.retained}/${parsed.amounts?.cash} on ${localDate}`
      ),
    }));

    checks.push(createCheck({
      key: 'open_clock_events',
      label: 'Open Clock Events',
      items: findOpenClockEvents(notes || []),
    }));
  }

  checks.push(await runOptionalTableCheck(serviceClient, {
    tableName: 'maintenance_loops',
    label: 'Duplicate Maintenance Loops',
    select: 'id, owner_id, title, status, created_at',
    keyBuilder: (row) => row.status === 'active' ? normalizeText(row.title) : null,
    patternBuilder: (row) => normalizeText(row.title),
  }));

  checks.push(await runOptionalTableCheck(serviceClient, {
    tableName: 'bossa_weekly_shifts',
    label: 'Duplicate Weekly Shifts',
    select: 'id, owner_id, week_start_date, day_of_week, created_at',
    keyBuilder: (row) => `${row.week_start_date || 'unknown'}|${row.day_of_week || 'unknown'}`,
    patternBuilder: (row) => `Week ${row.week_start_date || 'unknown'}, day ${row.day_of_week || 'unknown'}`,
  }));

  return checks;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const { user, supabase } = await requireUser(req);
    await requireAdminAccess(supabase, user);

    const serviceClient = getServiceClient();
    const checks = await runScanner(serviceClient);

    return res.status(200).json({
      ok: true,
      generatedAt: new Date().toISOString(),
      checks,
    });
  } catch (error) {
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ ok: false, error: 'Please sign in.' });
    }

    if (error?.statusCode === 403 || error?.message === 'Forbidden') {
      return res.status(403).json({ ok: false, error: 'You do not have admin access.' });
    }

    console.error('Database pattern scan failed', error);
    return res.status(500).json({ ok: false, error: 'Could not run database pattern scan.' });
  }
}
