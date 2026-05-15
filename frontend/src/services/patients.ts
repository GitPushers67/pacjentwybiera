import { supabase } from '../lib/supabase';
import type { PatientProfile } from '../types';

interface DbPatient {
  user_id: string;
  first_name: string;
  last_name: string;
  sex?: string | null;
  birth_year: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  cancer_type: string | null;
  treatment_type: string | null;
  allergens: string[];
}

function toProfile(row: DbPatient): PatientProfile {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    sex: row.sex === 'female' || row.sex === 'male' ? row.sex : '',
    birthYear: row.birth_year ?? 1970,
    weightKg: row.weight_kg ?? 65,
    heightCm: row.height_cm ?? 170,
    cancerType: row.cancer_type ?? '',
    treatmentType: (row.treatment_type as PatientProfile['treatmentType']) ?? '',
    allergens: row.allergens ?? [],
  };
}

export async function getPatient(): Promise<PatientProfile | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .single();

  if (error || !data) return null;
  return toProfile(data as DbPatient);
}

export async function upsertPatient(profile: PatientProfile): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('patients').upsert({
    user_id: user.id,
    first_name: profile.firstName,
    last_name: profile.lastName,
    sex: profile.sex || null,
    birth_year: profile.birthYear,
    weight_kg: profile.weightKg,
    height_cm: profile.heightCm,
    cancer_type: profile.cancerType,
    treatment_type: profile.treatmentType || null,
    allergens: profile.allergens,
  });
}
