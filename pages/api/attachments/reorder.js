import { requireUser } from '@/lib/supabaseServer';
import { recordMutation } from '@/lib/cardMutations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { card_id: cardId, orders = [] } = payload;

    if (!cardId || !Array.isArray(orders)) {
      return res.status(400).json({ error: 'Missing card_id or orders' });
    }

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id, user_id')
      .eq('id', cardId)
      .single();

    if (cardError || !card || card.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates = orders
      .filter((entry) => entry && entry.id !== undefined && entry.order !== undefined)
      .map((entry) => ({
        id: entry.id,
        "order": entry.order,
        updated_at: new Date().toISOString(),
      }));

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid orders provided' });
    }

    const { error: updateError } = await supabase
      .from('attachments')
      .upsert(updates, { onConflict: 'id' });

    if (updateError) {
      console.error('[attachments/reorder] upsert error', updateError);
      return res.status(500).json({ error: 'Failed to reorder attachments' });
    }

    await recordMutation(supabase, {
      userId: user.id,
      cardId,
      op: 'reorder_attachments',
      diff: { orders: updates.map(({ id, order }) => ({ id, order })) },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
