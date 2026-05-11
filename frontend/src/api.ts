import type { Meal, PatientProfile } from './types';

const API_BASE = 'https://pacjentwybiera.pl/wp-json/mobilnycatering/v1/menu-schedules';
const PATIENTS_STORAGE_KEY = 'pacjentwybiera:patients';

const SLOT_META: Record<number, { id: string; icon: string; time: string; timeHour: number }> = {
  0: { id: 'breakfast', icon: '🥣', time: 'ok. 8:00', timeHour: 8 },
  1: { id: 'lunch2',    icon: '🍎', time: 'ok. 10:30', timeHour: 10 },
  2: { id: 'dinner',    icon: '🍽️', time: 'ok. 13:00', timeHour: 13 },
  3: { id: 'snack',     icon: '🍏', time: 'ok. 16:00', timeHour: 16 },
  4: { id: 'supper',    icon: '🌙', time: 'ok. 19:00', timeHour: 19 },
  5: { id: 'shake',     icon: '🥤', time: 'dowolna pora', timeHour: 12 },
  6: { id: 'shot',      icon: '🌿', time: 'rano na czczo', timeHour: 7 },
};

function parseNum(s: string | null | undefined): number {
  if (!s) return 0;
  return Math.round(parseFloat(s.replace(',', '.')) || 0);
}

function stripHtml(s: string | null | undefined): string {
  return (s ?? '').replace(/<[^>]+>/g, '');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDish(dish: any, isRec: boolean, slotIcon: string) {
  const protein = parseNum(dish.protein);
  return {
    name: dish.dishName as string,
    emoji: slotIcon,
    why: isRec
      ? 'Opcja rekomendowana dietetycznie dla Twojego etapu leczenia.'
      : 'Opcja alternatywna — wybierz gdy rekomendowana nie odpowiada preferencjom.',
    tags: [
      { t: `${protein}g białka`, c: 'b' as const },
      ...(dish.eatCold    ? [{ t: 'na zimno',       c: 'g' as const }] : []),
      ...(dish.eatHot     ? [{ t: 'podawać ciepłe', c: '' as const  }] : []),
      ...(dish.vegetarian ? [{ t: 'wegetariańskie', c: 'g' as const }] : []),
      ...(dish.fish       ? [{ t: 'ryby',           c: '' as const  }] : []),
    ],
    kcal:    parseNum(dish.calories_kcal),
    protein,
    carbs:   parseNum(dish.carbohydrates),
    fat:     parseNum(dish.fat),
    isRec,
    score:       isRec ? 8 : 6,
    scoreReason: isRec
      ? 'Opcja rekomendowana przez dietetyka onkologicznego dla Twojego etapu leczenia.'
      : 'Opcja alternatywna dostępna na życzenie pacjenta.',
    ingredients:  dish.ingredientsName ? stripHtml(dish.ingredientsName) : undefined,
    allergensText: dish.allergens || undefined,
    weight:        dish.weight ? `${dish.weight}g` : undefined,
  };
}

export async function fetchMenuForDate(dateStr: string): Promise<Meal[] | null> {
  const url = new URL(API_BASE);
  url.searchParams.set('dietId',                '2388');
  url.searchParams.set('dietVariantId',         '4196');
  url.searchParams.set('dietVariantCaloriesId', '15759');
  url.searchParams.set('menuScheduleId',        '7274');
  url.searchParams.set('menuDateAsString',      dateStr);

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slots: any[] = (data.content ?? []).filter((s: any) => s.dishes?.length > 0);
    if (slots.length === 0) return null;

    return slots.map((slot) => {
      const meta = SLOT_META[slot.sortOrder as number] ?? {
        id: `meal-${slot.sortOrder}`,
        icon: '🍴',
        time: '',
        timeHour: 12,
      };
      return {
        id: meta.id,
        icon: meta.icon,
        title: slot.mealName as string,
        time: meta.time,
        timeHour: meta.timeHour,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options: (slot.dishes as any[]).map((dish, i) => mapDish(dish, i === 0, meta.icon)),
      } satisfies Meal;
    });
  } catch {
    return null;
  }
}

export async function listPatients(): Promise<PatientProfile[]> {
  if (typeof window === 'undefined') return [];

  const raw = window.localStorage.getItem(PATIENTS_STORAGE_KEY);
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((p): p is PatientProfile => (
    typeof p === 'object' &&
    p !== null &&
    typeof (p as PatientProfile).firstName === 'string' &&
    typeof (p as PatientProfile).lastName === 'string'
  ));
}
