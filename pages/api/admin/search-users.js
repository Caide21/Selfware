import { requireAdminAccess } from '@/lib/auth/adminAccess';
import { getServiceClient, requireUser } from '@/lib/supabaseServer';

function pickDisplayName(user) {
  const metadata = user?.user_metadata || user?.raw_user_meta_data || {};
  return metadata.display_name || metadata.full_name || metadata.name || null;
}

function normalizeUser(user) {
  return {
    id: user.id,
    email: user.email || null,
    displayName: pickDisplayName(user),
    createdAt: user.created_at || null,
  };
}

function matchesQuery(user, query) {
  const metadata = user?.user_metadata || user?.raw_user_meta_data || {};
  const fields = [
    user?.email,
    metadata?.name,
    metadata?.full_name,
    metadata?.display_name,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return fields.some((value) => value.includes(query));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { user, supabase } = await requireUser(req);
    await requireAdminAccess(supabase, user);

    const query = String(req.query?.q || '').trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'q is required.' });
    }
    if (query.length < 2) {
      return res.status(400).json({ error: 'q must be at least 2 characters.' });
    }

    const serviceClient = getServiceClient();

    const matches = [];
    const maxResults = 10;
    const perPage = 200;
    const maxPages = 5;

    for (let page = 1; page <= maxPages && matches.length < maxResults; page += 1) {
      const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage });
      if (error) throw error;

      const users = data?.users || [];
      if (!users.length) break;

      for (const candidate of users) {
        if (matches.length >= maxResults) break;
        if (!matchesQuery(candidate, query)) continue;
        matches.push(normalizeUser(candidate));
      }

      if (users.length < perPage) break;
    }

    return res.status(200).json({ users: matches });
  } catch (error) {
    if (error?.message === 'Unauthorized') {
      return res.status(401).json({ error: 'Please sign in.' });
    }

    if (error?.statusCode === 403 || error?.message === 'Forbidden') {
      return res.status(403).json({ error: 'You do not have admin access.' });
    }

    console.error('Admin user search failed', error);
    return res.status(500).json({ error: 'Could not run admin user search.' });
  }
}
