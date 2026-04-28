import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import InteractionTarget from '@/components/InteractionLayer/InteractionTarget';
import ExpandableCardBody from '@/components/CardKit/ExpandableCardBody';
import { TextAreaAuto, TextInput } from '@/components/Form';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { createReflectionInteractionTarget } from '@/lib/interactions/reflectionTargets';
import { supabase } from '@/lib/supabaseClient';

const PAGE_HEADING = {
  emoji: '',
  title: 'Reflections',
  subtitle: 'Meaning extraction',
};

function formatTimestamp(value) {
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

function SourceNoteContext({ note, loading, requested }) {
  if (loading) {
    return (
      <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-text/55">
        Loading source note...
      </div>
    );
  }

  if (requested && !note) {
    return (
      <div className="rounded-md border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
        Source note unavailable. You can still write a general reflection.
      </div>
    );
  }

  if (!note) return null;

  const timestamp = formatTimestamp(note.created_at);

  return (
    <aside className="rounded-md border border-cyan-300/15 bg-cyan-300/10 px-4 py-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/70">
        Source note
      </div>
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text/85">
        {note.content}
      </p>
      {timestamp ? (
        <time dateTime={note.created_at} className="mt-2 block text-[11px] leading-none text-text/40">
          {timestamp}
        </time>
      ) : null}
    </aside>
  );
}

function ReflectionFragment({ reflection, actionContext }) {
  const timestamp = formatTimestamp(reflection.created_at);
  const interactionTarget = createReflectionInteractionTarget(reflection);

  return (
    <InteractionTarget target={interactionTarget} actionContext={actionContext} className="w-full">
      <article className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
        {reflection.title ? (
          <h2 className="mb-2 text-base font-semibold text-text">{reflection.title}</h2>
        ) : null}
        <ExpandableCardBody
          contentClassName="whitespace-pre-wrap break-words text-sm leading-relaxed text-text/80"
          maxHeightClassName="max-h-48"
        >
          {reflection.content}
        </ExpandableCardBody>
        {timestamp ? (
          <time dateTime={reflection.created_at} className="mt-3 block text-[11px] leading-none text-text/40">
            {timestamp}
          </time>
        ) : null}
      </article>
    </InteractionTarget>
  );
}

export default function ReflectionsPage() {
  const router = useRouter();
  const sourceNoteId = typeof router.query.sourceNoteId === 'string' ? router.query.sourceNoteId : null;
  const [user, setUser] = useState(null);
  const [sourceNote, setSourceNote] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [reflectionsLoading, setReflectionsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  usePageHeading(PAGE_HEADING);

  const fetchReflections = useCallback(async (ownerId) => {
    setReflectionsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reflections')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setReflections(data ?? []);
    } catch (fetchError) {
      console.error('Failed to fetch reflections', fetchError);
      setError('Could not load reflections. Small chaos detected.');
    } finally {
      setReflectionsLoading(false);
    }
  }, []);

  const fetchSourceNote = useCallback(async (ownerId, noteId) => {
    if (!noteId) {
      setSourceNote(null);
      return;
    }

    setSourceLoading(true);

    try {
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('owner_id', ownerId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setSourceNote(data ?? null);
    } catch (fetchError) {
      console.error('Failed to fetch source note for reflection', fetchError);
      setSourceNote(null);
      setError('Could not load the source note.');
    } finally {
      setSourceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) return undefined;

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
          await Promise.all([
            fetchReflections(resolvedUser.id),
            fetchSourceNote(resolvedUser.id, sourceNoteId),
          ]);
        } else {
          setReflections([]);
          setSourceNote(null);
        }
      } catch (authError) {
        console.error('Failed to resolve user for reflections', authError);
        if (!cancelled) {
          setUser(null);
          setReflections([]);
          setSourceNote(null);
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
  }, [fetchReflections, fetchSourceNote, router.isReady, sourceNoteId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.id) {
      setError('Sign in required to save reflections.');
      return;
    }

    const trimmedContent = content.trim();
    const trimmedTitle = title.trim();
    if (!trimmedContent) return;

    setSaving(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('reflections')
        .insert({
          owner_id: user.id,
          source_note_id: sourceNote?.id || null,
          title: trimmedTitle || null,
          content: trimmedContent,
          zone: sourceNote?.zone || 'general',
          reflection_type: 'reflection',
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      setReflections((current) => [data, ...current]);
      setTitle('');
      setContent('');
    } catch (insertError) {
      console.error('Failed to create reflection', insertError);
      setError('Could not save reflection. The gremlin has been logged.');
    } finally {
      setSaving(false);
    }
  };

  const showSignInRequired = !authLoading && !user;
  const showEmpty = !authLoading && !reflectionsLoading && user && reflections.length === 0;
  const actionContext = {
    supabase,
    onDeleteReflection: (reflectionId) => {
      setReflections((current) => current.filter((reflection) => reflection.id !== reflectionId));
    },
  };

  return (
    <>
      <Head>
        <title>Reflections</title>
      </Head>

      <section className="mx-auto max-w-4xl space-y-6">
        <SourceNoteContext note={sourceNote} loading={sourceLoading} requested={Boolean(sourceNoteId)} />

        <form onSubmit={handleSubmit} className="space-y-3">
          <TextInput
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional title"
            disabled={authLoading || !user || saving}
            className="border-white/10 bg-white/5 text-text placeholder:text-text/35 focus:border-cta-accent focus:ring-cta-accent/25"
          />
          <TextAreaAuto
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Turn the signal into meaning."
            maxRows={10}
            disabled={authLoading || !user || saving}
            className="border-white/10 bg-white/5 text-text placeholder:text-text/35 focus:border-cta-accent focus:ring-cta-accent/25"
          />

          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton
              type="submit"
              disabled={authLoading || !user || saving || !content.trim()}
              className="px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save reflection'}
            </PrimaryButton>

            {authLoading ? <span className="text-sm text-text/55">Checking sign-in...</span> : null}
            {reflectionsLoading ? <span className="text-sm text-text/55">Loading reflections...</span> : null}
          </div>
        </form>

        {error ? (
          <div className="rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {showSignInRequired ? (
          <div className="text-sm text-text/60">Sign in required. Reflections need an owner before they can land.</div>
        ) : null}

        {showEmpty ? (
          <div className="text-sm text-text/55">No reflections logged yet. Meaning waits for the first pass.</div>
        ) : null}

        {reflections.length > 0 ? (
          <div className="space-y-3">
            {reflections.map((reflection) => (
              <ReflectionFragment key={reflection.id} reflection={reflection} actionContext={actionContext} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
