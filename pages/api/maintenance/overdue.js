import {
  isMissingMaintenanceLoopEnforcementSchema,
  listOverdueMaintenanceLoops,
  maintenanceLoopEnforcementMigrationMessage,
} from '@/lib/maintenanceLoops';
import { requireUser } from '@/lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { supabase, user } = await requireUser(req);
    const loops = await listOverdueMaintenanceLoops(supabase, {
      ownerId: user.id,
    });

    return res.status(200).json({
      overdue: loops.length > 0,
      count: loops.length,
      loops,
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

    console.error('[maintenance/overdue] failed', error);
    return res.status(500).json({ error: 'Could not check overdue maintenance loops.' });
  }
}
