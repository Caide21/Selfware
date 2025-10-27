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
    const { card_id: cardId, type, payload: attachmentPayload = {}, order } = payload;

    if (!cardId || !type) {
      return res.status(400).json({ error: 'Missing card_id or type' });
    }

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('id')
      .eq('id', cardId)
      .eq('user_id', user.id)
      .single();

    if (cardError || !card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    let nextOrder = order ?? 0;
    if (order === undefined) {
      const { data: existing } = await supabase
        .from('attachments')
        .select('"order"')
        .eq('card_id', cardId)
        .order('order', { ascending: false })
        .limit(1);
      if (existing && existing.length) {
        nextOrder = (existing[0].order || 0) + 1;
      }
    }

    const insertData = {
      card_id: cardId,
      type,
      payload: attachmentPayload,
      "order": nextOrder,
    };

    const { data: attachment, error: insertError } = await supabase
      .from('attachments')
      .insert(insertData)
      .select('*')
      .single();

    if (insertError) {
      console.error('[attachments/add] insert error', insertError);
      return res.status(500).json({ error: 'Failed to add attachment' });
    }

    await recordMutation(supabase, {
      userId: user.id,
      cardId,
      op: 'add_attachment',
      diff: { attachment },
    });

    return res.status(200).json({ attachment });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
