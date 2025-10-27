import { useEffect } from 'react';
import { useCardStore } from './useCardStore';
import { apply } from './mutations';

function isTypingTarget(target) {
  if (!target) return false;
  const tag = target.tagName?.toLowerCase();
  return tag === 'input' || tag === 'textarea' || target.isContentEditable;
}

function getNextOrder(cardsById) {
  const values = Object.values(cardsById);
  if (!values.length) return 0;
  return (
    values.reduce((max, card) => {
      const order = card.layout?.order ?? 0;
      return Math.max(max, order);
    }, 0) + 1
  );
}

export function useCardKeyboard() {
  const selection = useCardStore((state) => state.selection);
  const cardsById = useCardStore((state) => state.cardsById);
  const setMode = useCardStore((state) => state.setMode);
  const mode = useCardStore((state) => state.mode);
  const popUndo = useCardStore((state) => state.popUndo);
  const popRedo = useCardStore((state) => state.popRedo);

  useEffect(() => {
    function handler(event) {
      const isMeta = event.metaKey || event.ctrlKey;

      if (isMeta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          const entry = popRedo();
          if (entry) {
            apply(entry.op, entry.payload, { recordHistory: false });
          }
        } else {
          const entry = popUndo();
          if (entry?.inverse) {
            apply(entry.inverse.op, entry.inverse.payload, { recordHistory: false });
          }
        }
        return;
      }

      if (isMeta && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        const cardId = selection[0];
        const card = cardId ? cardsById[cardId] : null;
        if (card) {
          apply('create_card', {
            title: `${card.title || 'Untitled'} copy`,
            kind: card.kind,
            state: card.state,
            layout: { order: getNextOrder(cardsById) },
            meta: card.meta,
          });
        }
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (!isMeta && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        apply('create_card', {
          title: 'New Card',
          kind: 'note',
          state: { tags: [] },
          layout: { order: getNextOrder(cardsById) },
        });
        return;
      }

      if (!isMeta && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setMode(mode === 'edit' ? 'build' : 'edit');
        return;
      }

      if (!isMeta && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setMode(mode === 'play' ? 'build' : 'play');
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        const cardId = selection[0];
        if (cardId) {
          event.preventDefault();
          apply('delete_card', { id: cardId });
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selection, cardsById, setMode, mode, popUndo, popRedo]);
}
