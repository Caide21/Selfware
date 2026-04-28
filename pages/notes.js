import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import InteractionTarget from '@/components/InteractionLayer/InteractionTarget';
import ExpandableCardBody from '@/components/CardKit/ExpandableCardBody';
import { TextAreaAuto } from '@/components/Form';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { createNoteInteractionTarget } from '@/lib/interactions/noteTargets';
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

function NoteFragment({ note, actionContext }) {
  const timestamp = formatNoteTimestamp(note?.created_at);
  const interactionTarget = createNoteInteractionTarget(note);

  return (
    <InteractionTarget target={interactionTarget} actionContext={actionContext}>
      <article className="group inline-flex max-w-full flex-col gap-1 rounded-md px-2.5 py-2 transition hover:bg-white/5 hover:shadow-[0_0_20px_rgba(148,163,184,0.12)]">
        <ExpandableCardBody
          contentClassName="whitespace-pre-wrap break-words text-sm leading-relaxed text-text/85"
          maxHeightClassName="max-h-40"
        >
          {note.content}
        </ExpandableCardBody>
        {timestamp ? (
          <time
            dateTime={note.created_at}
            className="text-[11px] leading-none text-text/35 transition group-hover:text-text/50"
          >
            {timestamp}
          </time>
        ) : null}
      </article>
    </InteractionTarget>
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

    try {
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

      setNotes((current) => [data, ...current]);
      setContent('');
    } catch (insertError) {
      console.error('Failed to create note', insertError);
      setError('Could not save note. The gremlin has been logged.');
    } finally {
      setSaving(false);
    }
  };

  const showSignInRequired = !authLoading && !user;
  const showEmpty = !authLoading && !notesLoading && user && notes.length === 0;
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

        {showSignInRequired ? (
          <div className="text-sm text-text/60">Sign in required. Notes need an owner before they can land.</div>
        ) : null}

        {showEmpty ? (
          <div className="text-sm text-text/55">No signals logged yet. The board is clean.</div>
        ) : null}

        {notes.length > 0 ? (
          <div className="flex flex-col items-start gap-1.5">
            {notes.map((note) => (
              <NoteFragment key={note.id} note={note} actionContext={actionContext} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
