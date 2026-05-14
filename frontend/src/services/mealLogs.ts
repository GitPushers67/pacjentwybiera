import { supabase } from '../lib/supabase';
import type { Meal, MealStatus } from '../types';

export interface MealLog {
  id: string;
  date: string;
  meal_slot: string;
  meal_name: string;
  option_index: number;
  status: MealStatus;
  partial_pct: number | null;
  ordered_at: string;
  updated_at: string;
}

export async function upsertMealLog(log: {
  date: string;
  meal_slot: string;
  meal_name: string;
  option_index: number;
  status?: MealStatus;
}): Promise<MealLog | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('meal_logs')
    .upsert(
      {
        user_id: user.id,
        date: log.date,
        meal_slot: log.meal_slot,
        meal_name: log.meal_name,
        option_index: log.option_index,
        status: log.status ?? 'pending',
        ordered_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id,date,meal_slot' },
    )
    .select()
    .single();

  if (error || !data) return null;
  return data as MealLog;
}

export async function getMealLogs(date: string): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('date', date)
    .order('ordered_at');

  if (error || !data) return [];
  return data as MealLog[];
}

export async function getMealLogsRange(from: string, to: string): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('date')
    .order('ordered_at');

  if (error || !data) return [];
  return data as MealLog[];
}

export async function ensureDayMeals(date: string, meals: Meal[]): Promise<MealLog[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const existing = await getMealLogs(date);
  const existingSlots = new Set(existing.map((l) => l.meal_slot));
  const missing = meals.filter((m) => !existingSlots.has(m.title));

  if (missing.length === 0) return existing;

  const now = new Date().toISOString();
  await supabase.from('meal_logs').insert(
    missing.map((m) => ({
      user_id: user.id,
      date,
      meal_slot: m.title,
      meal_name: m.options[0].name,
      option_index: 0,
      status: 'pending' as MealStatus,
      ordered_at: now,
      updated_at: now,
    })),
  );

  return getMealLogs(date);
}

export async function updateMealStatus(
  id: string,
  status: MealStatus,
  partialPct?: number,
): Promise<void> {
  await supabase
    .from('meal_logs')
    .update({ status, partial_pct: partialPct ?? null, updated_at: new Date().toISOString() })
    .eq('id', id);
}
