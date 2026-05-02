export const HOUSEHOLD_ROLES = ['owner', 'editor', 'contributor', 'viewer'];
export const MANAGEABLE_ROLES = ['editor', 'contributor', 'viewer'];

function normalizeHouseholdRole(role) {
  if (role === 'member') return 'contributor';
  return HOUSEHOLD_ROLES.includes(role) ? role : null;
}

export async function listHouseholds(supabase) {
  const { data, error } = await supabase
    .from('households')
    .select('id, name, created_by, created_at, household_members(user_id, role)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((household) => ({
    ...household,
    household_members: (household.household_members || []).map((member) => ({
      ...member,
      role: normalizeHouseholdRole(member.role) || member.role,
    })),
  }));
}

export async function createHousehold(supabase, { name }) {
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new Error('Household needs a name.');

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;

  const userId = authData?.user?.id;
  if (!userId) throw new Error('Sign in required to create a household.');

  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      name: cleanName,
      created_by: userId,
    })
    .select('id, name, created_by, created_at')
    .single();

  if (householdError) throw householdError;

  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: household.id,
    user_id: userId,
    role: 'owner',
  });

  if (memberError) throw memberError;

  return {
    ...household,
    household_members: [{ user_id: userId, role: 'owner' }],
  };
}

export async function listHouseholdMembers(supabase, householdId) {
  if (!householdId) throw new Error('Select a household first.');

  const { data, error } = await supabase
    .from('household_members')
    .select('household_id, user_id, role, created_at')
    .eq('household_id', householdId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map((member) => ({
    ...member,
    role: normalizeHouseholdRole(member.role) || member.role,
  }));
}

export async function addHouseholdMember(supabase, { householdId, userId, role = 'contributor' }) {
  const cleanUserId = String(userId || '').trim();
  const normalizedRole = normalizeHouseholdRole(role);
  if (!householdId) throw new Error('Select a household first.');
  if (!cleanUserId) throw new Error('Member user ID is required.');
  if (!normalizedRole || normalizedRole === 'owner') {
    throw new Error('Choose editor, contributor, or viewer.');
  }

  const { data, error } = await supabase
    .from('household_members')
    .insert({
      household_id: householdId,
      user_id: cleanUserId,
      role: normalizedRole,
    })
    .select('household_id, user_id, role, created_at')
    .single();

  if (error) throw error;
  return {
    ...data,
    role: normalizeHouseholdRole(data.role) || data.role,
  };
}

export async function updateHouseholdMemberRole(supabase, { householdId, userId, role }) {
  const cleanUserId = String(userId || '').trim();
  const normalizedRole = normalizeHouseholdRole(role);
  if (!householdId) throw new Error('Select a household first.');
  if (!cleanUserId) throw new Error('Member user ID is required.');
  if (!normalizedRole || normalizedRole === 'owner') {
    throw new Error('Choose editor, contributor, or viewer.');
  }

  const { data, error } = await supabase
    .from('household_members')
    .update({ role: normalizedRole })
    .eq('household_id', householdId)
    .eq('user_id', cleanUserId)
    .select('household_id, user_id, role, created_at')
    .single();

  if (error) throw error;
  return {
    ...data,
    role: normalizeHouseholdRole(data.role) || data.role,
  };
}

export async function removeHouseholdMember(supabase, { householdId, userId }) {
  const cleanUserId = String(userId || '').trim();
  if (!householdId) throw new Error('Select a household first.');
  if (!cleanUserId) throw new Error('Member user ID is required.');

  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', cleanUserId);

  if (error) throw error;
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

export function getHouseholdRole(household, userId) {
  if (!household || !userId) return null;
  const member = (household.household_members || []).find((item) => item.user_id === userId);
  return normalizeHouseholdRole(member?.role);
}

export function canManageHouseholdMembers(role) {
  return role === 'owner';
}

export function canCreateSharedExpense(role) {
  return role === 'owner' || role === 'editor';
}

export function canCreateContribution(role) {
  return role === 'owner' || role === 'editor' || role === 'contributor';
}

export function roleLabel(role) {
  const normalizedRole = normalizeHouseholdRole(role);
  if (normalizedRole === 'owner') return 'Owner';
  if (normalizedRole === 'editor') return 'Editor';
  if (normalizedRole === 'contributor') return 'Contributor';
  if (normalizedRole === 'viewer') return 'Viewer';
  return 'Unknown';
}

export function isHouseholdMember(household, userId) {
  return !!getHouseholdRole(household, userId);
}

export function isHouseholdOwner(household, userId) {
  return getHouseholdRole(household, userId) === 'owner';
}
