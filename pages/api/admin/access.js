import { requireAdminAccess } from '@/lib/auth/adminAccess';
import { requireUser } from '@/lib/supabaseServer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { user, supabase } = await requireUser(req);
    const access = await requireAdminAccess(supabase, user);

    return res.status(200).json({
      ok: true,
      admin: true,
      reason: access.reason,
    });
  } catch (error) {
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Please sign in.' });
    }

    if (error?.statusCode === 403 || error?.message === 'Forbidden') {
      return res.status(403).json({ error: 'You do not have admin access.' });
    }

    console.error('Admin access check failed', error);
    return res.status(500).json({ error: 'Could not check admin access.' });
  }
}
