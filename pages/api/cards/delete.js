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
      return res.status(400).json({ error: 'Missing card id' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const { error: deleteError } = await supabase
      .from('cards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('[cards/delete] delete error', deleteError);
      return res.status(500).json({ error: 'Failed to delete card' });
    }

    await recordMutation(supabase, {
      userId: user.id,
      cardId: id,
      op: 'delete_card',
      diff: { state: existing.state || {}, layout: existing.layout || {} },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
