import { useMemo } from 'react';
import CardView from '@/components/CardBuilder/CardView';
import SectionBand from '@/components/Surface/SectionBand';
import PrimaryButton from '@/components/UI/PrimaryButton';
import GhostButton from '@/components/UI/GhostButton';
import Chip from '@/components/UI/Chip';
import CardEditor from '@/components/CardBuilder/CardEditor';
import { useCardStore } from '@/components/CardBuilder/useCardStore';
import { apply } from '@/components/CardBuilder/mutations';
import useLoadUserCards from '@/hooks/useLoadUserCards';

const STEPS = [
  {
    id: 'card-frame',
    title: 'Frame the week',
    kind: 'ritual',
    state: { tags: ['mind:ritual'], tone: 'info' },
    attachments: [
      {
        id: 'att-frame',
        type: 'text',
        payload: {
          content:
            'Capture quests, habits, and rituals so the HUD keeps today\'s priorities in plain view.',
        },
      },
    ],
  },
  {
    id: 'card-loadout',
    title: 'Equip the loadout',
    kind: 'workflow',
    state: { tags: ['mind:ready'], tone: 'status' },
    attachments: [
      {
        id: 'att-loadout',
        type: 'text',
        payload: {
          content:
            'Bundle tools, rituals, and focus modes into reusable kits that launch you straight into execution.',
        },
      },
    ],
  },
  {
    id: 'card-review',
    title: 'Play + review',
    kind: 'reflection',
    state: { tags: ['mind:flow-trigger'], tone: 'skill' },
    attachments: [
      {
        id: 'att-review',
        type: 'text',
        payload: {
          content: 'Log XP, pulse the scorecard, and adjust before friction stalls momentum.',
        },
      },
    ],
  },
];

const FEATURE_CARDS = [
  {
    id: 'feature-dashboards',
    title: 'Reality-first dashboards',
    kind: 'feature',
    state: {
      tone: 'info',
      tags: [{ slug: 'feature:signal', label: 'Signal', tone: 'info' }],
    },
    attachments: [
      {
        id: 'feature-dashboards-copy',
        type: 'text',
        payload: {
          content: 'Status panels, scorecards, and mirrors stay in sync so you always know what moved the needle.',
        },
      },
    ],
  },
  {
    id: 'feature-context',
    title: 'Narrative-friendly data',
    kind: 'feature',
    state: {
      tone: 'skill',
      tags: [{ slug: 'feature:context', label: 'Context', tone: 'skill' }],
    },
    attachments: [
      {
        id: 'feature-context-copy',
        type: 'text',
        payload: {
          content:
            'Every metric keeps the story around it-loadout notes, quest context, and reflection prompts travel with the numbers.',
        },
      },
    ],
  },
  {
    id: 'feature-ambient',
    title: 'Ambient accountability',
    kind: 'feature',
    state: {
      tone: 'ritual',
      tags: [{ slug: 'feature:ambient', label: 'Ambient', tone: 'ritual' }],
    },
    attachments: [
      {
        id: 'feature-ambient-copy',
        type: 'text',
        payload: {
          content:
            'Lightweight cues and reminders keep the corridor clear: no modal fatigue, just timely nudges in the HUD.',
        },
      },
    ],
  },
];

const PROOF_CARDS = [
  {
    id: 'proof-ship',
    title: 'Ship weekly with less thrash',
    kind: 'proof',
    state: {
      tone: 'success',
      tags: [{ slug: 'proof:ship', label: 'Outcome', tone: 'success' }],
    },
    attachments: [
      {
        id: 'proof-ship-copy',
        type: 'text',
        payload: {
          content: 'Scorecards flag stalled projects early so momentum compounds instead of leaking away.',
        },
      },
    ],
  },
  {
    id: 'proof-balance',
    title: 'Study without burning out',
    kind: 'proof',
    state: {
      tone: 'info',
      tags: [{ slug: 'proof:balance', label: 'Rhythm', tone: 'info' }],
    },
    attachments: [
      {
        id: 'proof-balance-copy',
        type: 'text',
        payload: {
          content: 'Ritual tracking highlights the inputs that sustain energy, grades, and portfolio pieces.',
        },
      },
    ],
  },
  {
    id: 'proof-xp',
    title: 'Turn reps into XP',
    kind: 'proof',
    state: {
      tone: 'skill',
      tags: [{ slug: 'proof:xp', label: 'Proof', tone: 'skill' }],
    },
    attachments: [
      {
        id: 'proof-xp-copy',
        type: 'text',
        payload: {
          content:
            'Experience points make progress visible and honest-every rep counts toward launches, revenue, and reputation.',
        },
      },
    ],
  },
];

function sortCards(cards = []) {
  return [...cards].sort((a, b) => {
    const ao = a?.layout?.order ?? 0;
    const bo = b?.layout?.order ?? 0;
    if (ao === bo) {
      return (a?.updated_at || a?.created_at || '').localeCompare(b?.updated_at || b?.created_at || '');
    }
    return ao - bo;
  });
}

function resolveDeck(liveCards = [], fallbackCards = [], attachmentsByCardId = {}) {
  const desiredLength = fallbackCards.length || liveCards.length || 0;
  const deck = liveCards.slice(0, desiredLength).map((card) => ({
    card,
    attachments: attachmentsByCardId[card.id] || [],
    interactive: true,
  }));

  if (deck.length < desiredLength) {
    const remaining = fallbackCards.slice(deck.length, desiredLength).map((card) => ({
      card,
      attachments: card.attachments || [],
      interactive: false,
    }));
    deck.push(...remaining);
  }

  return deck;
}

export default function TestPage() {
  const cardsById = useCardStore((state) => state.cardsById);
  const attachmentsByCardId = useCardStore((state) => state.attachmentsByCardId);
  const selection = useCardStore((state) => state.selection);
  const selectCard = useCardStore((state) => state.selectCard);
  const mode = useCardStore((state) => state.mode);
  const setMode = useCardStore((state) => state.setMode);

  useLoadUserCards();

  const sortedCards = useMemo(() => sortCards(Object.values(cardsById)), [cardsById]);

  const heroDeck = useMemo(
    () => resolveDeck(sortedCards.slice(0, STEPS.length), STEPS, attachmentsByCardId),
    [sortedCards, attachmentsByCardId]
  );
  const featureDeck = useMemo(
    () =>
      resolveDeck(
        sortedCards.slice(STEPS.length, STEPS.length + FEATURE_CARDS.length),
        FEATURE_CARDS,
        attachmentsByCardId
      ),
    [sortedCards, attachmentsByCardId]
  );
  const proofDeck = useMemo(
    () =>
      resolveDeck(
        sortedCards.slice(
          STEPS.length + FEATURE_CARDS.length,
          STEPS.length + FEATURE_CARDS.length + PROOF_CARDS.length
        ),
        PROOF_CARDS,
        attachmentsByCardId
      ),
    [sortedCards, attachmentsByCardId]
  );

  const activeCardId = selection[0];
  const activeCard = activeCardId ? cardsById[activeCardId] : null;
  const activeAttachments = activeCardId ? attachmentsByCardId[activeCardId] || [] : [];
  const cardCount = Object.keys(cardsById).length;

  return (
    <>
      <HeroSection />
      <HowItWorksSection
        cards={heroDeck}
        mode={mode}
        selectedId={activeCardId}
        onSelect={selectCard}
      />
      <FeaturesSection
        cards={featureDeck}
        mode={mode}
        selectedId={activeCardId}
        onSelect={selectCard}
      />
      <ProofSection
        cards={proofDeck}
        mode={mode}
        selectedId={activeCardId}
        onSelect={selectCard}
      />
      <LiveEditingPanel
        mode={mode}
        setMode={setMode}
        activeCard={activeCard}
        activeAttachments={activeAttachments}
        cardCount={cardCount}
      />
      <FinalCTA />
    </>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Chip className="bg-white/90 text-xs uppercase tracking-[0.45em] text-text-muted">
          RealityHUD Demo
        </Chip>
        <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          Explore the card system on a clean canvas.
        </h1>
        <p className="text-base leading-relaxed text-text-muted sm:text-lg">
          The test page mirrors the homepage layout while showing live cards pulled from the builder, so
          you can see how they breathe on white.
        </p>
        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
          <PrimaryButton href="/join">Request Early Access</PrimaryButton>
          <GhostButton href="#how-it-works">See the card flow</GhostButton>
        </div>
        <a
          href="#how-it-works"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-text-muted"
        >
          <span>See the steps</span>
          <span aria-hidden>↓</span>
        </a>
      </div>
    </section>
  );
}

function HowItWorksSection({ cards, mode, onSelect, selectedId }) {
  return (
    <SectionBand
      id="how-it-works"
      size="lg"
      style={{ '--band-bg': 'transparent', '--band': 'none' }}
    >
      <div className="flex flex-col gap-10 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            How it works
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">Cards in the corridor</h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            Pull live cards from the builder and surface them like tiles. Each one stays white with a thin
            halo so the corridor remains clear.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map(({ card, attachments, interactive }) => (
            <CardView
              key={card.id}
              card={card}
              attachments={attachments}
              play={mode === 'play'}
              selected={card.id === selectedId}
              interactive={interactive}
              onClick={interactive ? () => onSelect(card.id) : undefined}
            />
          ))}
        </div>
      </div>
    </SectionBand>
  );
}

function FeaturesSection({ cards, mode, onSelect, selectedId }) {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            Product signal
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">Built for visible, honest momentum</h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            Every subsystem keeps to the corridor: dashboards stay calm, reflections stay near the work,
            and no widget steals the centerline.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map(({ card, attachments, interactive }) => (
            <CardView
              key={card.id}
              card={card}
              attachments={attachments}
              play={mode === 'play'}
              selected={card.id === selectedId}
              interactive={interactive}
              onClick={interactive ? () => onSelect(card.id) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection({ cards, mode, onSelect, selectedId }) {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 text-center">
        <div className="space-y-3">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">Outcomes</span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">Proof the corridor stays clear</h2>
          <p className="mx-auto max-w-2xl text-base text-text-muted sm:text-lg">
            The HUD is designed for people who ship, study, and steward creative work in the same week.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map(({ card, attachments, interactive }) => (
            <CardView
              key={card.id}
              card={card}
              attachments={attachments}
              play={mode === 'play'}
              selected={card.id === selectedId}
              interactive={interactive}
              onClick={interactive ? () => onSelect(card.id) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function LiveEditingPanel({ mode, setMode, activeCard, activeAttachments, cardCount }) {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-4 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-muted">
            Live Builder
          </span>
          <h2 className="text-3xl font-semibold text-text sm:text-4xl">
            Edit the same cards right inside the corridor
          </h2>
          <p className="text-base text-text-muted sm:text-lg">
            Pull cards from Supabase, tweak copy, tags, or tone, and see the updates flow instantly into
            the hero rows above.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-text hover:border-primary/50 hover:text-primary transition"
            onClick={() =>
              apply('create_card', {
                title: 'New Card',
                kind: 'note',
                state: { tags: [] },
                layout: { order: cardCount },
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
        </div>

        {activeCard ? (
          <div className="grid gap-6 md:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-soft">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Card Editor
              </h3>
              <CardEditor
                card={activeCard}
                attachments={activeAttachments}
                onUpdate={(patch) => apply('update_card', { id: activeCard.id, patch })}
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
            <section className="space-y-3 rounded-2xl border border-white/40 bg-white/60 p-6 shadow-soft">
              <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Live Snapshot
              </h3>
              <CardView
                card={activeCard}
                attachments={activeAttachments}
                selected
                play={mode === 'play'}
                interactive={false}
              />
            </section>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/40 bg-white/70 px-6 py-10 text-center shadow-soft">
            <p className="text-sm text-text-muted">
              Select any live card above to start editing, or create a fresh one to seed the corridor.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-semibold text-text sm:text-4xl">
          Keep the corridor visible on every surface.
        </h2>
        <p className="text-base text-text-muted sm:text-lg">
          Join early access, map the first mission, and see the aisle stay clear from kickoff to review.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <PrimaryButton href="/join">Join the waitlist</PrimaryButton>
          <GhostButton href="/caide">Meet the team</GhostButton>
        </div>
      </div>
    </section>
  );
}

TestPage.showCorridorSpine = false;
