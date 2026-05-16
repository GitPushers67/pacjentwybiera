export interface Tag {
  t: string;
  c: 'g' | 'o' | 'b' | 'a' | '';
}

export interface MealOption {
  name: string;
  emoji: string;
  why: string;
  tags: Tag[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  isRec: boolean;
  score: number;
  scoreReason: string;
  ingredients?: string;
  allergensText?: string;
  weight?: string;
}

export interface Meal {
  id: string;
  icon: string;
  title: string;
  time: string;
  timeHour: number;
  options: MealOption[];
}

export interface PlanMeal {
  emoji: string;
  type: string;
  name: string;
  kcal: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  badge: string;
  bc: 'g' | 'o' | 'p' | '';
}

export interface PlanDay {
  label: string;
  sub: string;
  meals: PlanMeal[];
}

export interface Allergen {
  key: string;
  label: string;
  icon: string;
}

export interface PatientProfile {
  firstName: string;
  lastName: string;
  sex: 'female' | 'male' | '';
  birthYear: number;
  weightKg: number;
  heightCm: number;
  cancerType: string;
  treatmentType: 'chemo' | 'radio' | 'surgery' | 'combined' | '';
  allergens: string[];
}

export type EatenStatus = 'none' | 'full';

export type MealStatus = 'pending' | 'eaten' | 'partial' | 'not_eaten' | 'eaten_alternative';

export interface MealCardState {
  status: MealStatus;
  partialPct?: number;
  showPlate?: boolean;
}

export type Screen =
  | 'login' | 'onboarding' | 'home' | 'plan' | 'order' | 'add-sym' | 'profile'
  | 'confirm' | 'allergens' | 'nutrition' | 'chat';

export type SymptomKey =
  | 'nausea' | 'taste' | 'taste_change' | 'diarrhea' | 'mouth' | 'const'
  | 'fatigue' | 'appetite' | 'dryness' | 'metal';

export type NotEatenReason = 'no_appetite' | 'bad_taste' | 'bad_feeling';

export interface MealFeedback {
  mealId: string;
  type: 'eaten' | 'not_eaten';
  reason?: NotEatenReason;
  date: string;
}

export interface SymptomEntry {
  key: string;
  severity: 1 | 3 | 5;
}

export interface SymptomHistoryEntry {
  id?: string;
  key: string;
  addedAt: string;
  scale: number;
  note?: string;
}
