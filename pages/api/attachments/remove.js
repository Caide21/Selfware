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
    const { id } = payload;

    if (!id) {
      return res.status(400).json({ error: 'Missing attachment id' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('attachments')
      .select('id, card_id, type')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .select('user_id')
      .eq('id', existing.card_id)
      .single();

    if (cardError || !card || card.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { error: deleteError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[attachments/remove] delete error', deleteError);
      return res.status(500).json({ error: 'Failed to remove attachment' });
    }

    await recordMutation(supabase, {
      userId: user.id,
      cardId: existing.card_id,
      op: 'remove_attachment',
      diff: { attachment: { id: existing.id, type: existing.type } },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
