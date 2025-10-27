import { requireUser } from '@/lib/supabaseServer';
import { recordMutation } from '@/lib/cardMutations';

const ALLOWED_FIELDS = new Set(['payload', 'type', 'order']);

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
      return res.status(400).json({ error: 'Missing attachment id' });
    }

    const { data: existing, error: fetchError } = await supabase
      .from('attachments')
      .select('*, cards!inner(user_id)')
      .eq('id', id)
      .eq('cards.user_id', user.id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const updatePayload = { updated_at: new Date().toISOString() };
    for (const key of Object.keys(patch)) {
      if (ALLOWED_FIELDS.has(key)) {
        if (key === 'order') {
          updatePayload['order'] = patch[key];
        } else {
          updatePayload[key] = patch[key];
        }
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('attachments')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[attachments/update] update error', updateError);
      return res.status(500).json({ error: 'Failed to update attachment' });
    }

    await recordMutation(supabase, {
      userId: user.id,
      cardId: updated.card_id,
      op: 'update_attachment',
      diff: { attachment: { id: updated.id, patch: updatePayload } },
    });

    return res.status(200).json({ attachment: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const status = message === 'Unauthorized' ? 401 : 500;
    return res.status(status).json({ error: message });
  }
}
