// Decide "Caide can edit anywhere". Keep it simple and central.
export function hasEditAccess(user) {
  if (!user) return false;
  // Prefer a stable ID if available; fallback to display name or email.
  const name = (user.user_metadata?.name || user.user_metadata?.full_name || user.name || '').toLowerCase();
  const email = (user.email || '').toLowerCase();
  return name.includes('caide') || email.startsWith('caidetaylor') || email.includes('caide');
}
