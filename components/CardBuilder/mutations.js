import { useCardStore } from './useCardStore';
import { supabase } from '@/lib/supabaseClient';

const API_ENDPOINTS = {
  create_card: '/api/cards/create',
  update_card: '/api/cards/update',
  delete_card: '/api/cards/delete',
  move_card: '/api/cards/move',
  add_attachment: '/api/attachments/add',
  update_attachment: '/api/attachments/update',
  remove_attachment: '/api/attachments/remove',
  reorder_attachments: '/api/attachments/reorder',
};

function toast(message) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cardbuilder-error', { detail: { message } }));
  }
  console.error('[CardBuilder]', message);
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

async function request(op, payload) {
  const endpoint = API_ENDPOINTS[op];
  if (!endpoint) throw new Error(`Unknown mutation op: ${op}`);

  const token = await getAccessToken();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(json?.error || 'Mutation failed');
    err.status = response.status;
    throw err;
  }
  return json;
}

const pendingTimers = new Map();

const handlers = {
  create_card: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const tempId = payload.tempId || `temp-${Date.now()}`;
      const optimisticCard = {
        id: tempId,
        title: payload.title || 'Untitled Card',
        kind: payload.kind || 'generic',
        state: payload.state || {},
        layout: payload.layout || {},
        meta: payload.meta || {},
        __optimistic: true,
      };
      store.upsertCard(optimisticCard);
      return {
        tempId,
        rollback: () => store.removeCard(tempId),
      };
    },
    async finalize(payload, response, context, options) {
      const store = useCardStore.getState();
      if (context?.tempId) {
        store.removeCard(context.tempId);
      }
      if (response?.card) {
        store.upsertCard(response.card);
        if (options.recordHistory) {
          store.pushHistory({
            op: 'create_card',
            payload: { id: response.card.id },
            inverse: { op: 'delete_card', payload: { id: response.card.id, snapshot: response.card } },
          });
        }
      }
    },
  },
  update_card: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const existing = store.cardsById[payload.id];
      if (!existing) return null;
      const snapshot = { ...existing };
      const next = { ...existing, ...payload.patch };
      store.upsertCard(next);
      return {
        snapshot,
        rollback: () => store.upsertCard(snapshot),
      };
    },
    async finalize(payload, response, context, options) {
      const store = useCardStore.getState();
      if (response?.card) {
        store.upsertCard(response.card);
        if (options.recordHistory) {
          store.pushHistory({
            op: 'update_card',
            payload,
            inverse: { op: 'update_card', payload: { id: response.card.id, patch: context?.snapshot || {} } },
          });
        }
      }
    },
  },
  delete_card: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const snapshot = store.cardsById[payload.id];
      store.removeCard(payload.id);
      return {
        snapshot,
        rollback: () => {
          if (snapshot) store.upsertCard(snapshot);
        },
      };
    },
    async finalize(payload, _response, _context, options) {
      const store = useCardStore.getState();
      if (options.recordHistory) {
        store.pushHistory({
          op: 'delete_card',
          payload,
        });
      }
    },
  },
  move_card: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const card = store.cardsById[payload.id];
      if (!card) return null;
      const snapshot = { ...card.layout };
      store.upsertCard({ ...card, layout: { ...card.layout, ...payload.layoutPatch } });
      return {
        snapshot,
        rollback: () => {
          const stale = store.cardsById[payload.id];
          if (stale) {
            store.upsertCard({ ...stale, layout: snapshot });
          }
        },
      };
    },
    async finalize(payload, _response, _context, options) {
      const store = useCardStore.getState();
      if (options.recordHistory) {
        store.pushHistory({
          op: 'move_card',
          payload,
        });
      }
    },
  },
  add_attachment: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const tempId = payload.tempId || `temp-attachment-${Date.now()}`;
      const optimisticAttachment = {
        id: tempId,
        card_id: payload.card_id,
        type: payload.type,
        payload: payload.payload || {},
        order: payload.order ?? 0,
        __optimistic: true,
      };
      store.upsertAttachment(payload.card_id, optimisticAttachment);
      return {
        tempId,
        rollback: () => store.removeAttachment(payload.card_id, tempId),
      };
    },
    async finalize(payload, response, context, options) {
      const store = useCardStore.getState();
      if (context?.tempId) {
        store.removeAttachment(payload.card_id, context.tempId);
      }
      if (response?.attachment) {
        store.upsertAttachment(payload.card_id, response.attachment);
        if (options.recordHistory) {
          store.pushHistory({
            op: 'add_attachment',
            payload,
            inverse: { op: 'remove_attachment', payload: { id: response.attachment.id, card_id: payload.card_id } },
          });
        }
      }
    },
  },
  update_attachment: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const attachments = store.attachmentsByCardId[payload.card_id] || [];
      const existing = attachments.find((item) => item.id === payload.id);
      if (!existing) return null;
      const snapshot = { ...existing };
      const updated = { ...existing, ...payload.patch };
      store.upsertAttachment(payload.card_id, updated);
      return {
        snapshot,
        pendingValue: updated.payload,
        rollback: () => store.upsertAttachment(payload.card_id, snapshot),
      };
    },
    async finalize(payload, response, context, options) {
      const store = useCardStore.getState();
      if (response?.attachment) {
        const cardId = response.attachment.card_id;
        const list = store.attachmentsByCardId[cardId] || [];
        const current = list.find((item) => item.id === response.attachment.id);
        const pendingValue = context?.pendingValue;

        if (
          pendingValue &&
          pendingValue.content !== undefined &&
          current?.payload?.content !== pendingValue.content
        ) {
          return;
        }

        store.upsertAttachment(response.attachment.card_id, response.attachment);
        if (options.recordHistory) {
          store.pushHistory({
            op: 'update_attachment',
            payload,
          });
        }
      }
    },
  },
  remove_attachment: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const attachments = store.attachmentsByCardId[payload.card_id] || [];
      const snapshot = attachments.find((item) => item.id === payload.id);
      store.removeAttachment(payload.card_id, payload.id);
      return {
        snapshot,
        rollback: () => {
          if (snapshot) store.upsertAttachment(payload.card_id, snapshot);
        },
      };
    },
    async finalize(payload, _response, _context, options) {
      const store = useCardStore.getState();
      if (options.recordHistory) {
        store.pushHistory({
          op: 'remove_attachment',
          payload,
        });
      }
    },
  },
  reorder_attachments: {
    optimistic(payload) {
      const store = useCardStore.getState();
      const attachments = store.attachmentsByCardId[payload.card_id] || [];
      const snapshot = attachments.map((item) => ({ ...item }));
      const reordered = attachments.map((item) => {
        const update = payload.orders.find((row) => row.id === item.id);
        return update ? { ...item, order: update.order } : item;
      });
      store.setAttachments(payload.card_id, reordered);
      return {
        snapshot,
        rollback: () => store.setAttachments(payload.card_id, snapshot),
      };
    },
    async finalize(payload, _response, _context, options) {
      const store = useCardStore.getState();
      if (options.recordHistory) {
        store.pushHistory({
          op: 'reorder_attachments',
          payload,
        });
      }
    },
  },
};

export async function apply(op, payload = {}, options = {}) {
  const finalOptions = { recordHistory: true, ...options };
  const handler = handlers[op];
  if (!handler) {
    throw new Error(`No mutation handler for op ${op}`);
  }

  let context = null;

  const run = async () => {
    try {
      const response = await request(op, payload);
      if (handler.finalize) {
        await handler.finalize(payload, response, context, finalOptions);
      }
      return response;
    } catch (error) {
      if (context?.rollback) {
        context.rollback();
      }
      if (error.message !== 'cancelled') {
        toast(error.message || 'Mutation failed');
      }
      throw error;
    }
  };

  if (handler.optimistic) {
    context = handler.optimistic(payload) || null;
  }

  if (op === 'update_attachment' && String(payload.id || '').startsWith('temp-')) {
    return Promise.resolve(null);
  }

  if (finalOptions.debounceMs) {
    const key =
      `${op}:` +
      (payload.id || payload.card_id || payload.attachment_id || payload.tempId || '');

    if (pendingTimers.has(key)) {
      const prev = pendingTimers.get(key);
      clearTimeout(prev.timer);
      prev.resolve?.(null);
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        pendingTimers.delete(key);
        try {
          const result = await run();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, finalOptions.debounceMs);

      pendingTimers.set(key, { timer, resolve, reject });
    });
  }

  if (handler.optimistic) {
    context = handler.optimistic(payload) || null;
  }

  if (op === 'update_attachment' && String(payload.id || '').startsWith('temp-')) {
    return Promise.resolve(null);
  }

  return await run();
}
