export async function supaSafe(promise, label) {
  const { data, error } = await promise;
  if (error) {
    console.error(`[Supabase:${label}]`, error);
    throw error;
  }
  return data;
}


