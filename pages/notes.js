import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import InteractionTarget from '@/components/InteractionLayer/InteractionTarget';
import ExpandableCardBody from '@/components/CardKit/ExpandableCardBody';
import { TextAreaAuto } from '@/components/Form';
import CommandKeyDrawer from '@/components/Notes/CommandKeyDrawer';
import GhostButton from '@/components/ui/GhostButton';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { createNoteInteractionTarget } from '@/lib/interactions/noteTargets';
import { createFinanceTransactionRow, parseFinanceCommand } from '@/lib/financeCommands';
import { parseNoteCommand } from '@/lib/parseNoteCommand';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '[]',
  title: 'Notes',
  subtitle: 'Raw signal capture',
};

function formatNoteTimestamp(value) {
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

function NoteFragment({ note, actionContext, onUpdateNote }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const timestamp = formatNoteTimestamp(note?.created_at);
  const interactionTarget = createNoteInteractionTarget(note);

  useEffect(() => {
    if (!isEditing) setDraft(note?.content || '');
  }, [isEditing, note?.content]);

  const handleStartEdit = () => {
    setDraft(note?.content || '');
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft(note?.content || '');
    setEditError(null);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const nextContent = draft.trim();
    if (!nextContent) {
      setEditError('Notes need content before they can land.');
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      await onUpdateNote(note.id, nextContent);
      setIsEditing(false);
    } catch (updateError) {
      console.error('Failed to update note', updateError);
      setEditError(updateError?.message || 'Could not update note. Small chaos detected.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <InteractionTarget target={interactionTarget} actionContext={actionContext}>
      <article className="group inline-flex max-w-full flex-col gap-1 rounded-md px-2.5 py-2 transition hover:bg-white/5 hover:shadow-[0_0_20px_rgba(148,163,184,0.12)]">
        {isEditing ? (
          <div className="w-full min-w-[min(32rem,calc(100vw-3rem))] space-y-2" onContextMenu={(event) => event.stopPropagation()}>
            <TextAreaAuto
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxRows={10}
              disabled={isSaving}
              className="min-h-[96px] border-white/10 bg-white/10 px-3 py-2.5 text-sm leading-relaxed text-text caret-cta-accent placeholder:text-text/35 focus:border-cta-accent focus:ring-cta-accent/25"
              aria-label="Edit note content"
            />
            {editError ? (
              <div className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-100">
                {editError}
              </div>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <PrimaryButton
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving || !draft.trim()}
                className="px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </PrimaryButton>
              <GhostButton
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs text-text/80 ring-white/15 hover:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </GhostButton>
            </div>
          </div>
        ) : (
          <>
            <ExpandableCardBody
              contentClassName="whitespace-pre-wrap break-words text-sm leading-relaxed text-text/85"
              maxHeightClassName="max-h-40"
            >
              {note.content}
            </ExpandableCardBody>
            <div className="flex flex-wrap items-center gap-2">
              {timestamp ? (
                <time
                  dateTime={note.created_at}
                  className="text-[11px] leading-none text-text/35 transition group-hover:text-text/50"
                >
                  {timestamp}
                </time>
              ) : null}
              <button
                type="button"
                onClick={handleStartEdit}
                className="rounded px-1.5 py-0.5 text-[11px] leading-none text-text/35 transition hover:bg-white/10 hover:text-text/75 focus:bg-white/10 focus:text-text/75 focus:outline-none"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </article>
    </InteractionTarget>
  );
}

function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return 'R 0.00';
  return `R ${num.toFixed(2)}`;
}

function ParsedCommandPreview({ parsed }) {
  if (!parsed) return null;

  const detailItems = Object.entries(parsed.amounts || {}).map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
    const displayValue = key.toLowerCase().includes('percentage')
      ? `${Number(value).toFixed(2)}%`
      : formatCurrency(value);
    return [label, displayValue];
  });
  if (parsed.payload?.tableNumber) detailItems.unshift(['Table', parsed.payload.tableNumber]);
  if (parsed.payload?.source) detailItems.push(['Source', parsed.payload.source]);
  if (parsed.payload?.person) detailItems.push(['Person', parsed.payload.person]);
  if (parsed.payload?.direction) detailItems.push(['Direction', parsed.payload.direction]);
  if (parsed.payload?.reason) detailItems.push(['Reason', parsed.payload.reason]);
  if (parsed.description) detailItems.push(['Label', parsed.description]);

  return (
    <div
      className={[
        'rounded-lg border px-3 py-2 text-sm shadow-sm',
        parsed.valid
          ? 'border-emerald-300/60 bg-emerald-50/95 text-emerald-950'
          : 'border-amber-300/70 bg-amber-50/95 text-amber-950',
      ].join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold text-current">
          Parsed command: /{parsed.command || 'unknown'}
        </div>
        <div
          className={[
            'rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
            parsed.valid
              ? 'border-emerald-300 bg-white/80 text-emerald-800'
              : 'border-amber-300 bg-white/80 text-amber-800',
          ].join(' ')}
        >
          {parsed.valid ? parsed.event_type : 'Needs detail'}
        </div>
      </div>
      {parsed.valid ? (
        <>
          <div className="mt-1 text-sm leading-relaxed text-current/85">{parsed.summary}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {detailItems.map(([label, value]) => (
              <span
                key={label}
                className={[
                  'rounded-full border bg-white/85 px-2 py-1 text-xs font-medium',
                  parsed.valid ? 'border-emerald-200 text-emerald-900' : 'border-amber-200 text-amber-900',
                ].join(' ')}
              >
                {label}: {value}
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="mt-1 text-sm leading-relaxed text-current/85">{parsed.error}</div>
      )}
    </div>
  );
}

export default function NotesPage() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [warning, setWarning] = useState(null);

  usePageHeading(PAGE_HEADING);

  const fetchNotes = useCallback(async (ownerId) => {
    setNotesLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setNotes(data ?? []);
    } catch (fetchError) {
      console.error('Failed to fetch notes', fetchError);
      setError('Could not load notes. Small chaos detected.');
    } finally {
      setNotesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      setAuthLoading(true);
      setError(null);

      try {
        const { data, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (cancelled) return;

        const resolvedUser = data?.user ?? null;
        setUser(resolvedUser);

        if (resolvedUser?.id) {
          await fetchNotes(resolvedUser.id);
        } else {
          setNotes([]);
        }
      } catch (authError) {
        console.error('Failed to resolve user for notes', authError);
        if (!cancelled) {
          setUser(null);
          setNotes([]);
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
  }, [fetchNotes]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setError('Sign in required to save notes.');
      return;
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    setSaving(true);
    setError(null);
    setWarning(null);

    try {
      const parsed = parseNoteCommand(trimmed);
      const financeParsed = parseFinanceCommand(trimmed);
      if (parsed && !parsed.valid && !financeParsed?.valid) {
        setError(financeParsed?.error || parsed.error || 'Command needs more detail before it can be saved.');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({
          content: trimmed,
          zone: 'general',
          note_type: 'note',
          owner_id: user.id,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      if (parsed?.valid) {
        const { error: eventInsertError } = await supabase.from('note_events').insert({
          note_id: data.id,
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

        if (eventInsertError) {
          console.error('Failed to create note event', eventInsertError);
          setWarning('Note saved, but the command event could not be structured yet.');
        }
      }

      const financeTransaction = createFinanceTransactionRow({
        parsed: financeParsed,
        ownerId: user.id,
        sourceNote: data,
      });

      if (financeTransaction) {
        const { error: financeInsertError } = await supabase
          .from('finance_transactions')
          .insert(financeTransaction);

        if (financeInsertError) {
          console.error('Failed to create finance transaction', financeInsertError);
          setWarning('Note saved, but the finance transaction could not be structured yet.');
        }
      }

      setNotes((current) => [data, ...current]);
      setContent('');
    } catch (insertError) {
      console.error('Failed to create note', insertError);
      setError('Could not save note. The gremlin has been logged.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId, nextContent) => {
    if (!user?.id) {
      throw new Error('Sign in required to edit notes.');
    }

    const trimmed = nextContent.trim();
    if (!trimmed) {
      throw new Error('Notes need content before they can land.');
    }

    const { data, error: updateError } = await supabase
      .from('notes')
      .update({ content: trimmed })
      .eq('id', noteId)
      .eq('owner_id', user.id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    setNotes((current) => current.map((note) => (note.id === noteId ? data : note)));
  };

  const showSignInRequired = !authLoading && !user;
  const showEmpty = !authLoading && !notesLoading && user && notes.length === 0;
  const parsedCommand = parseFinanceCommand(content) || parseNoteCommand(content);
  const actionContext = {
    supabase,
    onDeleteNote: (noteId) => {
      setNotes((current) => current.filter((note) => note.id !== noteId));
    },
  };

  return (
    <>
      <Head>
        <title>Notes</title>
      </Head>

      <section className="mx-auto max-w-4xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextAreaAuto
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Catch the signal before it slips."
            maxRows={8}
            disabled={authLoading || !user || saving}
            className="border-white/10 bg-white/5 text-text placeholder:text-text/35 focus:border-cta-accent focus:ring-cta-accent/25"
          />

          <CommandKeyDrawer />

          <ParsedCommandPreview parsed={parsedCommand} />

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton
              type="submit"
              disabled={authLoading || !user || saving || !content.trim()}
              className="px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save note'}
            </PrimaryButton>

            {authLoading ? <span className="text-sm text-text/55">Checking sign-in...</span> : null}
            {notesLoading ? <span className="text-sm text-text/55">Loading notes...</span> : null}
          </div>
        </form>

        {error ? (
          <div className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {warning ? (
          <div className="rounded-md border border-amber-300/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {warning}
          </div>
        ) : null}

        {showSignInRequired ? (
          <div className="text-sm text-text/60">Sign in required. Notes need an owner before they can land.</div>
        ) : null}

        {showEmpty ? (
          <div className="text-sm text-text/55">No signals logged yet. The board is clean.</div>
        ) : null}

        {notes.length > 0 ? (
          <div className="flex flex-col items-start gap-1.5">
            {notes.map((note) => (
              <NoteFragment
                key={note.id}
                note={note}
                actionContext={actionContext}
                onUpdateNote={handleUpdateNote}
              />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
