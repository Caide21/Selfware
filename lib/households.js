export async function listHouseholds(supabase) {
  const { data, error } = await supabase
    .from('households')
    .select('id, name, created_by, created_at, household_members(user_id, role)')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createHousehold(supabase, { name, userId }) {
  const cleanName = String(name || '').trim();
  if (!cleanName) throw new Error('Household needs a name.');
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

export async function addHouseholdMemberByUserId(supabase, { householdId, userId, role = 'member' }) {
  const cleanUserId = String(userId || '').trim();
  if (!householdId) throw new Error('Select a household first.');
  if (!cleanUserId) throw new Error('Member user ID is required.');

  const { data, error } = await supabase
    .from('household_members')
    .insert({
      household_id: householdId,
      user_id: cleanUserId,
      role,
    })
    .select('household_id, user_id, role, created_at')
    .single();

  if (error) throw error;
  return data;
}

export function isHouseholdMember(household, userId) {
  if (!household || !userId) return false;
  return (household.household_members || []).some((member) => member.user_id === userId);
}

export function isHouseholdOwner(household, userId) {
  if (!household || !userId) return false;
  return (household.household_members || []).some((member) => member.user_id === userId && member.role === 'owner');
}
