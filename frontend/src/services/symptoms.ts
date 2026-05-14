import { supabase } from '../lib/supabase';
import type { SymptomHistoryEntry } from '../types';

interface DbSymptom {
  id: string;
  symptom_key: string;
  scale: number;
  note: string | null;
  recorded_at: string;
}

function toEntry(row: DbSymptom): SymptomHistoryEntry & { id: string } {
  return {
    id: row.id,
    key: row.symptom_key,
    addedAt: row.recorded_at,
    scale: row.scale,
    note: row.note ?? undefined,
  };
}

export async function addSymptomEntry(
  entry: Omit<SymptomHistoryEntry, 'addedAt'> & { addedAt?: string },
): Promise<(SymptomHistoryEntry & { id: string }) | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('symptom_entries')
    .insert({
      user_id: user.id,
      symptom_key: entry.key,
      scale: entry.scale,
      note: entry.note ?? null,
      recorded_at: entry.addedAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) return null;
  return toEntry(data as DbSymptom);
}

export async function getSymptomEntries(
  from: string,
  to: string,
): Promise<(SymptomHistoryEntry & { id: string })[]> {
  const { data, error } = await supabase
    .from('symptom_entries')
    .select('*')
    .gte('recorded_at', from)
    .lte('recorded_at', to)
    .order('recorded_at', { ascending: false });

  if (error || !data) return [];
  return (data as DbSymptom[]).map(toEntry);
}

export async function deleteSymptomEntry(id: string): Promise<void> {
  await supabase.from('symptom_entries').delete().eq('id', id);
}
