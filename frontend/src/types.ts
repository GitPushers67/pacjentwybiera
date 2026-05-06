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
  isRec: boolean;
}

export interface Meal {
  id: string;
  icon: string;
  title: string;
  time: string;
  options: MealOption[];
}

export interface PlanMeal {
  emoji: string;
  type: string;
  name: string;
  kcal: number;
  badge: string;
  bc: 'g' | 'o' | 'p' | '';
}

export interface PlanDay {
  label: string;
  sub: string;
  meals: PlanMeal[];
}

export type Screen = 'home' | 'plan' | 'order' | 'add-sym' | 'profile' | 'confirm';

export type SymptomKey = 'nausea' | 'taste' | 'diarrhea' | 'mouth' | 'const' | 'fatigue' | 'appetite' | 'dryness' | 'metal';
