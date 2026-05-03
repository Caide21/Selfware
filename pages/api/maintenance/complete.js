import {
  completeMaintenanceLoop,
  isMissingMaintenanceLoopEnforcementSchema,
  maintenanceLoopEnforcementMigrationMessage,
} from '@/lib/maintenanceLoops';
import { requireUser } from '@/lib/supabaseServer';

function parsePayload(body) {
  return typeof body === 'string' ? JSON.parse(body || '{}') : body || {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const payload = parsePayload(req.body);
    const result = await completeMaintenanceLoop(supabase, {
      ownerId: user.id,
      id: payload.id || payload.loop_id || null,
      title: payload.title || null,
      source: payload.source || 'api',
      sourceNoteId: payload.source_note_id || payload.sourceNoteId || null,
    });

    return res.status(200).json({
      completed: true,
      loop: {
        id: result.loop.id,
        title: result.loop.title,
      },
      completion: {
        id: result.completion.id,
        completed_on: result.completion.completed_on,
        completed_at: result.completion.completed_at,
        source: result.completion.source,
        source_note_id: result.completion.source_note_id || null,
      },
    });
  } catch (error) {
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (isMissingMaintenanceLoopEnforcementSchema(error)) {
      return res.status(501).json({
        error: maintenanceLoopEnforcementMigrationMessage(),
      });
    }

    const statusCode = error?.statusCode || 500;
    if (statusCode < 500) {
      return res.status(statusCode).json({ error: error.message });
    }

    console.error('[maintenance/complete] failed', error);
    return res.status(500).json({ error: 'Could not complete maintenance loop.' });
  }
}
