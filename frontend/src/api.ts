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
  url.searchParams.set('dietVariantId',         '4881');
  url.searchParams.set('dietVariantCaloriesId', '18414');
  url.searchParams.set('menuScheduleId',        '7354');
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

export async function fetchAiRecommendation(payload: any): Promise<{
  globalReason: string;
  choices: Record<string, { choice: number; reason: string }>;
} | null> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `Jesteś ekspertem dietetyki klinicznej wspierającym pacjentów onkologicznych.
Zadanie: Wybierz najlepsze dania dla pacjenta na pojutrze, z dostępnych opcji dla poszczególnych posiłków.

Dane pacjenta:
${JSON.stringify(payload.patient, null, 2)}

Dzisiejsze objawy:
${JSON.stringify(payload.symptoms, null, 2)}

Historia objawów:
${JSON.stringify(payload.symptomHistory, null, 2)}

Spożycie posiłków dzisiaj (full = zjedzone, none = niezjedzone):
${JSON.stringify(payload.eatenMap, null, 2)}

Dostępne posiłki do wyboru na pojutrze:
${JSON.stringify(payload.activeMeals, null, 2)}

Zasady i wytyczne:
1. NIEZALEŻNOŚĆ OCENY: Zignoruj całkowicie pola isRec, score oraz scoreReason - to sztywne wartości systemowe. Zrób samodzielną ocenę na podstawie składników, makroskładników i objawów pacjenta.
2. DOPASOWANIE DO OBJAWÓW (KLINICZNE):
   - Nudności/wymioty: preferuj dania na zimno, łagodne, bez intensywnych zapachów, unikaj tłustych.
   - Biegunka: preferuj dania zapierające (ryż, marchew), unikaj nadmiaru błonnika.
   - Zaparcia: preferuj opcje z warzywami i owocami.
   - Brak apetytu: preferuj posiłki gęste odżywczo, wysokobiałkowe.
   - Zmiany w jamie ustnej: unikaj dań kwaśnych, gorących i twardych.
3. PERSONALIZACJA: W uzasadnieniach zwracaj się empatycznie do pacjenta na "Ty" (używając imienia z profilu).
4. ODWAŻNE DECYZJE: Wybieraj alternatywę (opcja 1), jeśli lepiej pasuje do objawów niż domyślna opcja 0.
5. UZASADNIENIE OGÓLNE (globalReason): Podsumuj w 2-3 zdaniach strategię na dzień.
6. Zwróć DOKŁADNIE w formacie JSON:
{"globalReason": "uzasadnienie", "choices": {"breakfast": {"choice": 0, "reason": "uzasadnienie"}, "lunch2": {"choice": 1, "reason": "uzasadnienie"}}}
Dopasuj klucze w choices do id posiłków z danych wejściowych.`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Jesteś asystentem zwracającym odpowiedzi tylko w formacie JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return null;
  }
}
