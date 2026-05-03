export const PARTY_SESSIONS_TABLE = 'party_sessions';

export function isMissingPartySessionsTable(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    error?.code === '42P01'
    || error?.code === 'PGRST205'
    || message.includes('party_sessions')
    || message.includes('could not find the table')
    || message.includes('does not exist')
    || message.includes('schema cache')
  );
}

export function partySessionsMigrationMessage() {
  return 'Party Time needs the public.party_sessions table. Apply supabase/migrations/202605030004_party_sessions.sql.';
}

export async function findActivePartySession(supabase, { ownerId }) {
  if (!ownerId) throw new Error('Sign in required to check Party Time.');

  const { data, error } = await supabase
    .from(PARTY_SESSIONS_TABLE)
    .select('*')
    .eq('owner_id', ownerId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] || null;
}

export async function startPartySession(supabase, { ownerId, sourceNote }) {
  if (!ownerId) throw new Error('Sign in required to start Party Time.');

  const activeSession = await findActivePartySession(supabase, { ownerId });
  if (activeSession?.id) {
    return {
      action: 'already_active',
      session: activeSession,
      message: 'Party Time is already active. End the open session before starting another.',
    };
  }

  const { data, error } = await supabase
    .from(PARTY_SESSIONS_TABLE)
    .insert({
      owner_id: ownerId,
      started_at: sourceNote?.created_at || new Date().toISOString(),
      start_note_id: sourceNote?.id || null,
      label: 'partytime',
      participants: [],
    })
    .select('*')
    .single();

  if (error) throw error;

  return {
    action: 'started',
    session: data,
    message: 'Party Time started. Signal restored.',
  };
}

export async function endPartySession(supabase, { ownerId, sourceNote }) {
  if (!ownerId) throw new Error('Sign in required to end Party Time.');

  const activeSession = await findActivePartySession(supabase, { ownerId });
  if (!activeSession?.id) {
    return {
      action: 'none_active',
      session: null,
      message: 'No active Party Time session found.',
    };
  }

  const { data, error } = await supabase
    .from(PARTY_SESSIONS_TABLE)
    .update({
      ended_at: new Date().toISOString(),
      end_note_id: sourceNote?.id || null,
    })
    .eq('id', activeSession.id)
    .eq('owner_id', ownerId)
    .is('ended_at', null)
    .select('*')
    .single();

  if (error) throw error;

  return {
    action: 'ended',
    session: data,
    message: 'Party Time ended. Session closed.',
  };
}

export async function applyPartyTimeCommand(supabase, { parsed, ownerId, sourceNote }) {
  if (!parsed?.valid || !['partytime', 'endpartytime'].includes(parsed.command)) return null;

  if (parsed.command === 'partytime') {
    return startPartySession(supabase, { ownerId, sourceNote });
  }

  return endPartySession(supabase, { ownerId, sourceNote });
}
