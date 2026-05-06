import type { Meal, MealOption } from './types';

export function getOption(meal: Meal, idx: number): MealOption {
  const i = ((idx % meal.options.length) + meal.options.length) % meal.options.length;
  return meal.options[i];
}
