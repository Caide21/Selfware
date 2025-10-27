import { requireUser } from '@/lib/supabaseServer';
import { recordMutation, diffTags } from '@/lib/cardMutations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    const state = payload.state || {};
    const layout = payload.layout || {};
    const meta = payload.meta || {};

    const insertData = {
      user_id: user.id,
      title: payload.title || 'Untitled Card',
      kind: payload.kind || 'generic',
      state,
      layout,
      meta,
    };

    const { data: card, error } = await supabase
      .from('cards')
      .insert(insertData)
      .select('*')
      .single();

    if (error) {
      console.error('[cards/create] insert error', error);
      return res.status(500).json({ error: 'Failed to create card' });
    }

    const tagDiff = diffTags([], card.state?.tags || []);
    const mutationDiff = { ...(tagDiff || {}), state: state };

    await recordMutation(supabase, {
      userId: user.id,
      cardId: card.id,
      op: 'create_card',
      diff: mutationDiff,
    });

    return res.status(200).json({ card });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
