import { useMemo, useState, useCallback } from 'react';
import CardView from './CardView';
import { useCardStore } from './useCardStore';
import { apply } from './mutations';

function sortCards(cards) {
  return [...cards].sort((a, b) => {
    const ao = a.layout?.order ?? 0;
    const bo = b.layout?.order ?? 0;
    if (ao === bo) {
      return (a.created_at || '').localeCompare(b.created_at || '');
    }
    return ao - bo;
  });
}

export default function CardCanvas({ context, tag }) {
  const cardsById = useCardStore((state) => state.cardsById);
  const attachmentsByCardId = useCardStore((state) => state.attachmentsByCardId);
  const selectCard = useCardStore((state) => state.selectCard);
  const selection = useCardStore((state) => state.selection);
  const mode = useCardStore((state) => state.mode);
  const [dragging, setDragging] = useState(null);
  const [overId, setOverId] = useState(null);

  const cards = useMemo(() => {
    const list = Object.values(cardsById);
    const filtered = context
      ? list.filter((card) => card.state?.context === context)
      : list;
    const tagFiltered = tag
      ? filtered.filter((card) => (card.state?.tags || []).some((t) => (t.slug || t) === tag))
      : filtered;
    return sortCards(tagFiltered);
  }, [cardsById, context, tag]);

  const handleDrop = useCallback(async () => {
    if (!dragging || !overId || dragging === overId) {
      setDragging(null);
      setOverId(null);
      return;
    }

    const movingIndex = cards.findIndex((card) => card.id === dragging);
    const overIndex = cards.findIndex((card) => card.id === overId);

    if (movingIndex < 0 || overIndex < 0) {
      setDragging(null);
      setOverId(null);
      return;
    }

    const reordered = [...cards];
    const [movingCard] = reordered.splice(movingIndex, 1);
    reordered.splice(overIndex, 0, movingCard);

    reordered.forEach((card, index) => {
      if ((card.layout?.order ?? index) !== index) {
        apply('move_card', { id: card.id, layoutPatch: { order: index } });
      }
    });

    setDragging(null);
    setOverId(null);
  }, [cards, dragging, overId]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const attachments = attachmentsByCardId[card.id] || [];
        const selected = selection.includes(card.id);
        return (
          <div
            key={card.id}
            draggable
            onClick={() => selectCard(card.id)}
            onDragStart={(event) => {
              setDragging(card.id);
              event.dataTransfer.effectAllowed = 'move';
              const img = new Image();
              img.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
              event.dataTransfer.setDragImage(img, 0, 0);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (card.id !== dragging) {
                setOverId(card.id);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setOverId(card.id);
              handleDrop();
            }}
            onDragEnd={() => {
              setDragging(null);
              setOverId(null);
            }}
            className={`transition-all duration-150 ${overId === card.id ? 'ring-2 ring-purple-400/70 rounded-2xl' : ''}`}
          >
            <CardView
              card={card}
              attachments={attachments}
              selected={selected}
              play={mode === 'play'}
              onClick={() => selectCard(card.id)}
            />
          </div>
        );
      })}
    </div>
  );
}
