// pages/sandbox.js
import { useMemo, useRef, useState } from 'react';
import { usePageHeading } from '@/components/Layout/PageShell';
import SectionHeading from '@/components/SectionHeading';
import InfiniteCanvas from '@/components/Canvas/InfiniteCanvas';
import BookCard from '@/components/Cards/BookCard';

const FALLBACK_IMG = '/neural-web.png';

// Demo placeholders for the "Grammar" deck
const PLACEHOLDERS = [
  { id: 'focus', title: 'Scroll of Focus', cover: FALLBACK_IMG },
  { id: 'breath', title: 'Ritual of Breath', cover: FALLBACK_IMG },
  { id: 'map', title: 'Map of Mirrors', cover: FALLBACK_IMG },
  { id: 'echo', title: 'Doctrine of Echo', cover: FALLBACK_IMG },
  { id: 'fog', title: 'On Fog & Clarity', cover: FALLBACK_IMG },
];

// Demo placeholders for the "Beliefs" deck
const BELIEFS = [
  { id: 'truth', title: 'On First Principles', cover: FALLBACK_IMG },
  { id: 'ethic', title: 'Ethics of Building', cover: FALLBACK_IMG },
  { id: 'aim', title: 'Aim & Telos', cover: FALLBACK_IMG },
];

const PAGE_HEADING = {
  emoji: "dY�",
  title: 'Sandbox',
  subtitle: 'Hover a stack and use �+? / �+\' (or scroll) to flip cards. Drag to move, wheel outside to zoom.',
};

export default function Sandbox() {
  // Two canvas nodes: left "Grammar" and right "Beliefs"
  const nodes = useMemo(
    () => [
      {
        id: 'grammar-stack',
        x: 140,
        y: 160,
        w: 780, // canvas footprint; card size is handled in CardStack
        h: 380,
        payload: { title: 'Grammar', items: PLACEHOLDERS },
      },
      {
        id: 'beliefs-stack',
        x: 980, // to the right; adjust for spacing as desired (grid = 48px)
        y: 160,
        w: 780,
        h: 380,
        payload: { title: 'Beliefs', items: BELIEFS },
      },
    ],
    []
  );

  usePageHeading(PAGE_HEADING);

  return (
    <main className="min-h-screen px-6 pb-10 text-text">
      <SectionHeading title="Infinite Canvas" subtitle="Two draggable stacks with keyboard nav" />

      <InfiniteCanvas
        initialNodes={nodes}
        renderNode={(n) => (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">{n.payload.title}</h2>
            <CardStack items={n.payload.items} />
          </div>
        )}
        onNodesChange={() => {}}
        gridSize={48}
        snapToGrid
      />
    </main>
  );
}

/* ---------------- CardStack (stacked deck with hover + arrow keys) ---------------- */

function CardStack({ items = [] }) {
  const [index, setIndex] = useState(0);
  const deckRef = useRef(null);
  const wrap = (i) => (items.length ? (i + items.length) % items.length : 0);

  // Focus the deck on hover so arrow keys work
  const onMouseEnter = () => deckRef.current?.focus();
  const onKeyDown = (e) => {
    if (!items.length) return;
    if (e.key === 'ArrowRight') setIndex((i) => wrap(i + 1));
    if (e.key === 'ArrowLeft') setIndex((i) => wrap(i - 1));
    if (e.key === 'Home') setIndex(0);
    if (e.key === 'End') setIndex(items.length - 1);
  };
  const onWheel = (e) => {
    e.stopPropagation(); // don�?Tt zoom the canvas while flipping
    if (!items.length) return;
    setIndex((i) => wrap(i + (e.deltaY > 0 ? 1 : -1)));
  };

  // Visual params
  const cardW = 560;
  const cardH = 260;
  const overlapX = 68; // horizontal overlap between cards
  const depthScale = 0.05; // shrink per step away from active
  const liftY = 10; // slight lift for active card
  const fanDeg = 1.6; // tiny rotation per step
  const hud = items.length ? `${index + 1} / ${items.length}` : '0 / 0';

  return (
    <div
      ref={deckRef}
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
      className="relative outline-none select-none"
      style={{ width: cardW + 2 * overlapX, height: cardH + 48 }}
      title="Hover and use �+? / �+' to flip cards"
    >
      {/* stacked cards */}
      <div className="absolute left-0 top-0 perspective-[1200px]">
        {items.map((it, i) => {
          const d = i - index; // distance from active card
          const abs = Math.abs(d);
          const scale = 1 - abs * depthScale;
          const xBase = i * overlapX; // baseline stagger
          const translateX = xBase - index * overlapX; // keep active centered-ish
          const translateY = d === 0 ? -liftY : 0;
          const rotateZ = d * fanDeg;
          const z = 1000 - abs; // ensure active is on top

          return (
            <div
              key={it.id || i}
              className="absolute will-change-transform"
              style={{
                width: cardW,
                height: cardH,
                transform: `
                  translate3d(${translateX}px, ${translateY}px, 0)
                  rotateZ(${rotateZ}deg)
                  scale(${scale})
                `,
                transformOrigin: 'left center',
                zIndex: z,
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
            >
              <BookCard title={it.title} cover={it.cover} width={cardW} height={cardH} />
            </div>
          );
        })}
      </div>

      {/* small HUD */}
      <div className="absolute -top-8 right-0 text-xs text-theme-muted">{hud}</div>
    </div>
  );
}
