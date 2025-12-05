import { supabase } from '@/lib/supabaseClient';

export async function createHabit(payload, polarity) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) throw new Error('Not signed in');

  const { data, error } = await supabase
    .from('habits')
    .insert([
      {
        ...payload,
        polarity,
        owner_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
