export function parseAdminUserIds() {
  return String(process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function userOwnsAnyHousehold(supabase, userId) {
  const cleanUserId = String(userId || '').trim();
  if (!cleanUserId) return false;

  const { count, error } = await supabase
    .from('household_members')
    .select('household_id', { count: 'exact', head: true })
    .eq('user_id', cleanUserId)
    .eq('role', 'owner');

  if (error) throw error;
  return Number(count || 0) > 0;
}

export async function getAdminAccess(supabase, user) {
  const userId = user?.id;
  if (!userId) {
    return {
      allowed: false,
      reason: 'missing_user',
      isAllowlistedAdmin: false,
      isHouseholdOwner: false,
    };
  }

  const adminUserIds = parseAdminUserIds();
  const isAllowlistedAdmin = adminUserIds.includes(userId);
  const isHouseholdOwner = await userOwnsAnyHousehold(supabase, userId);

  return {
    allowed: isAllowlistedAdmin || isHouseholdOwner,
    reason: isAllowlistedAdmin ? 'allowlisted_admin' : isHouseholdOwner ? 'household_owner' : 'not_admin',
    isAllowlistedAdmin,
    isHouseholdOwner,
  };
}

export async function requireAdminAccess(supabase, user) {
  const access = await getAdminAccess(supabase, user);
  if (!access.allowed) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
  return access;
}
