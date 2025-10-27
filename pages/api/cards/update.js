import { requireUser } from '@/lib/supabaseServer';
import { recordMutation, diffTags } from '@/lib/cardMutations';

const ALLOWED_FIELDS = new Set(['title', 'kind', 'state', 'layout', 'meta']);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { id, patch = {} } = payload;

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

    const updatePayload = { updated_at: new Date().toISOString() };
    for (const key of Object.keys(patch)) {
      if (ALLOWED_FIELDS.has(key)) {
        updatePayload[key] = patch[key];
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('cards')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[cards/update] update error', updateError);
      return res.status(500).json({ error: 'Failed to update card' });
    }

    const tagDiff = diffTags(existing.state?.tags, updated.state?.tags);
    const diff = {
      ...(tagDiff || {}),
      patch: updatePayload,
    };

    await recordMutation(supabase, {
      userId: user.id,
      cardId: updated.id,
      op: 'update_card',
      diff,
    });

    return res.status(200).json({ card: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
