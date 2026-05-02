import { createClient } from '@supabase/supabase-js';
import { requireUser } from '@/lib/supabaseServer';

function parseAdminUserIds() {
  return String(process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

async function userOwnsAnyHousehold(supabase, userId) {
  const { count, error } = await supabase
    .from('household_members')
    .select('household_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'owner');

  if (error) throw error;
  return Number(count || 0) > 0;
}

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

function createAdminServiceClient() {
  const supabaseUrl = String(process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl) {
    return { error: 'Admin search requires NEXT_PUBLIC_SUPABASE_URL.' };
  }

  if (!serviceRoleKey) {
    return { error: 'Admin search requires SUPABASE_SERVICE_ROLE_KEY.' };
  }

  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    return { error: 'Invalid Supabase URL for admin search.' };
  }

  console.error('[admin/search-users] Supabase URL:', supabaseUrl);

  return {
    client: createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const { user, supabase } = await requireUser(req);
    const adminUserIds = parseAdminUserIds();
    const isAllowlistedAdmin = adminUserIds.includes(user.id);
    const isHouseholdOwner = await userOwnsAnyHousehold(supabase, user.id);

    if (!isAllowlistedAdmin && !isHouseholdOwner) {
      return res.status(403).json({ error: 'You do not have admin access.' });
    }

    const query = String(req.query?.q || '').trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'q is required.' });
    }
    if (query.length < 2) {
      return res.status(400).json({ error: 'q must be at least 2 characters.' });
    }

    const { client: serviceClient, error: serviceClientError } = createAdminServiceClient();
    if (serviceClientError) {
      return res.status(500).json({ error: serviceClientError });
    }

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

    console.error('Admin user search failed', error);
    return res.status(500).json({ error: 'Could not run admin user search.' });
  }
}
