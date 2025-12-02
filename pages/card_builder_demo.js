import { useMemo, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import CardCanvas from '@/components/CardBuilder/CardCanvas';
import CardView from '@/components/CardBuilder/CardView';
import { useCardStore } from '@/components/CardBuilder/useCardStore';
import { useCardKeyboard } from '@/components/CardBuilder/keyboard';
import { apply } from '@/components/CardBuilder/mutations';
import { resolveTags } from '@/components/ui/tagRegistry';
import CardEditor from '@/components/CardBuilder/CardEditor';
import useLoadUserCards from '@/hooks/useLoadUserCards';

const PAGE_HEADING = {
  emoji: '[]',
  title: 'Card Builder',
  subtitle: 'Compose cards with shared badges, tones, and motion.',
};



export default function CardBuilderDemo() {
  const cardsById = useCardStore((state) => state.cardsById);
  const mode = useCardStore((state) => state.mode);
  const setMode = useCardStore((state) => state.setMode);
  const attachmentsByCardId = useCardStore((state) => state.attachmentsByCardId);
  const selection = useCardStore((state) => state.selection);
  const [filterTag, setFilterTag] = useState('');
  const [context, setContext] = useState('');

  usePageHeading(PAGE_HEADING);

  useCardKeyboard();
  useLoadUserCards();

  const tagOptions = useMemo(() => {
    const tags = new Set();
    Object.values(cardsById).forEach((card) => {
      resolveTags(card.state?.tags || []).forEach((tag) => {
        if (tag.slug) tags.add(tag.slug);
      });
    });
    return Array.from(tags);
  }, [cardsById]);

  const activeCardId = selection[0];
  const activeCard = activeCardId ? cardsById[activeCardId] : null;
  const activeAttachments = activeCardId ? attachmentsByCardId[activeCardId] || [] : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-text hover:border-primary/50 hover:text-primary transition"
          onClick={() =>
            apply('create_card', {
              title: 'New Card',
              kind: 'note',
              state: { tags: [] },
              layout: { order: Object.keys(cardsById).length },
            })
          }
        >
          New Card
        </button>
        <button
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-text hover:border-primary/50 hover:text-primary transition"
          onClick={() => setMode(mode === 'play' ? 'build' : 'play')}
        >
          {mode === 'play' ? 'Switch to Build' : 'Switch to Play'}
        </button>
        <select
          className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-text"
          value={context}
          onChange={(event) => setContext(event.target.value)}
        >
          <option value="">All contexts</option>
          <option value="status_panel">Status Panel</option>
          <option value="mind_arsenal">Mind Arsenal</option>
        </select>
        <select
          className="rounded-full border border-slate-300 bg-white px-3 py-2 text-sm text-text"
          value={filterTag}
          onChange={(event) => setFilterTag(event.target.value)}
        >
          <option value="">All tags</option>
          {tagOptions.map((slug) => (
            <option key={slug} value={slug}>
              {slug}
            </option>
          ))}
        </select>
      </div>

      <CardCanvas context={context || undefined} tag={filterTag || undefined} />

      {activeCard ? (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="order-2 md:order-1 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Card Editor</h2>
            <CardEditor
              card={activeCard}
              attachments={activeAttachments}
              onUpdate={(patch) => apply('update_card', { id: activeCard.id, patch })}
              onExit={() => setMode('build')}
              onUpdateTags={(tags) =>
                apply('update_card', {
                  id: activeCard.id,
                  patch: { state: { ...activeCard.state, tags } },
                })
              }
              onAddAttachment={(attachment) =>
                apply('add_attachment', {
                  card_id: attachment.card_id,
                  type: attachment.type,
                  payload: attachment.payload,
                })
              }
              onUpdateAttachment={(prev, next) =>
                apply(
                  'update_attachment',
                  {
                    id: prev.id,
                    card_id: prev.card_id,
                    patch: { payload: next.payload },
                  },
                  { debounceMs: 300 }
                )
              }
            />
          </section>
          <section className="order-1 space-y-3 md:order-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Card Snapshot</h2>
            <CardView card={activeCard} attachments={activeAttachments} selected play={mode === 'play'} />
          </section>
        </div>
      ) : null}

      <div className="space-y-2 text-xs text-text-muted">
        <p>Keyboard: Escape exits the editor when focused.</p>
        <p>
          Listen for <code>cardbuilder-error</code> events to surface toasts.
        </p>
      </div>
    </div>
  );
}









