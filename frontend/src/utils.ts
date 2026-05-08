import type { Meal, MealOption } from './types';

export function getOption(meal: Meal, idx: number): MealOption {
  const i = ((idx % meal.options.length) + meal.options.length) % meal.options.length;
  return meal.options[i];
}

const PL_WEEKDAY_LONG = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const PL_WEEKDAY_SHORT = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
const PL_MONTHS_GEN = [
  'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
];

export function getToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function isWeekend(d: Date): boolean {
  return d.getDay() === 0 || d.getDay() === 6;
}

export function getOrderableDate(): Date {
  return addDays(getToday(), 2);
}

export function formatDateForAPI(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateLongPL(date: Date): string {
  return `${PL_WEEKDAY_LONG[date.getDay()]}, ${date.getDate()} ${PL_MONTHS_GEN[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShortPL(date: Date): string {
  return `${PL_WEEKDAY_SHORT[date.getDay()]}, ${date.getDate()} ${PL_MONTHS_GEN[date.getMonth()]}`;
}

export function getDayKey(date: Date): string {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
}

export function getWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d;
}
