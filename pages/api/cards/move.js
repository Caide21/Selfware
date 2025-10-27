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
    const { id, layoutPatch = {} } = payload;

    if (!id) {
      return res.status(400).json({ error: 'Missing card id' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('cards')
      .select('id, layout')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const newLayout = { ...(existing.layout || {}), ...layoutPatch };

    const { data: updated, error: updateError } = await supabase
      .from('cards')
      .update({ layout: newLayout, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id, layout')
      .single();

    if (updateError) {
      console.error('[cards/move] update error', updateError);
      return res.status(500).json({ error: 'Failed to move card' });
    }

    await recordMutation(supabase, {
      userId: user.id,
      cardId: updated.id,
      op: 'move_card',
      diff: { layout: layoutPatch },
    });

    return res.status(200).json({ card: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
