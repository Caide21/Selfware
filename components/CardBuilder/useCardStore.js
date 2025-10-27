import { create } from 'zustand';

function normaliseArray(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean);
}

export const useCardStore = create((set, get) => ({
  cardsById: {},
  attachmentsByCardId: {},
  selection: [],
  mode: 'build',
  history: {
    past: [],
    future: [],
  },

  setMode(mode) {
    set({ mode });
  },

  setCards(cards = []) {
    const next = {};
    normaliseArray(cards).forEach((card) => {
      next[card.id] = card;
    });
    set({ cardsById: next });
  },

  upsertCard(card) {
    if (!card?.id) return;
    set((state) => ({
      cardsById: {
        ...state.cardsById,
        [card.id]: card,
      },
    }));
  },

  removeCard(id) {
    if (!id) return;
    set((state) => {
      const next = { ...state.cardsById };
      delete next[id];
      const nextAttachments = { ...state.attachmentsByCardId };
      delete nextAttachments[id];
      const nextSelection = state.selection.filter((sel) => sel !== id);
      return {
        cardsById: next,
        attachmentsByCardId: nextAttachments,
        selection: nextSelection,
      };
    });
  },

  setAttachments(cardId, attachments = []) {
    if (!cardId) return;
    set((state) => ({
      attachmentsByCardId: {
        ...state.attachmentsByCardId,
        [cardId]: normaliseArray(attachments),
      },
    }));
  },

  upsertAttachment(cardId, attachment) {
    if (!cardId || !attachment?.id) return;
    set((state) => {
      const attachments = state.attachmentsByCardId[cardId] || [];
      const index = attachments.findIndex((item) => item.id === attachment.id);
      const next = [...attachments];
      if (index >= 0) {
        next[index] = attachment;
      } else {
        next.push(attachment);
      }
      return {
        attachmentsByCardId: {
          ...state.attachmentsByCardId,
          [cardId]: next,
        },
      };
    });
  },

  removeAttachment(cardId, attachmentId) {
    if (!cardId || !attachmentId) return;
    set((state) => {
      const attachments = state.attachmentsByCardId[cardId] || [];
      return {
        attachmentsByCardId: {
          ...state.attachmentsByCardId,
          [cardId]: attachments.filter((item) => item.id !== attachmentId),
        },
      };
    });
  },

  selectCard(id, { additive = false } = {}) {
    set((state) => {
      if (!id) return { selection: [] };
      if (additive) {
        const existing = new Set(state.selection);
        if (existing.has(id)) {
          existing.delete(id);
        } else {
          existing.add(id);
        }
        return { selection: Array.from(existing) };
      }
      return { selection: [id] };
    });
  },

  clearSelection() {
    set({ selection: [] });
  },

  pushHistory(entry) {
    if (!entry) return;
    set((state) => ({
      history: {
        past: [...state.history.past, entry],
        future: [],
      },
    }));
  },

  popUndo() {
    const { history } = get();
    if (!history.past.length) return null;
    const past = [...history.past];
    const entry = past.pop();
    set({
      history: {
        past,
        future: [entry, ...history.future],
      },
    });
    return entry;
  },

  popRedo() {
    const { history } = get();
    if (!history.future.length) return null;
    const [entry, ...rest] = history.future;
    set({
      history: {
        past: [...history.past, entry],
        future: rest,
      },
    });
    return entry;
  },
}));
