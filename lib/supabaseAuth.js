async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token || null;
  if (!token) throw new Error('Unauthenticated');
  return token;
}
