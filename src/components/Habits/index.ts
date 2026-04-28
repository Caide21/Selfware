import { supabase } from '@/lib/supabaseClient';

export type HabitPolarity = 'good' | 'bad' | 'neutral';

export interface HabitPayload {
  title?: string;
  description?: string;
  cadence?: string;
  streak?: number;
  status?: string;
  xp_value?: number;
  polarity?: HabitPolarity;
  [key: string]: unknown;
}

export interface HabitRow extends HabitPayload {
  id: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createHabit(payload: HabitPayload, polarity: HabitPolarity = 'good'): Promise<HabitRow> {
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
        user_id: user.id,
      },
    ])
    .select()
    .single<HabitRow>();

  if (error) throw error;
  return data as HabitRow;
}
