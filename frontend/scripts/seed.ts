// Uruchomienie: npx tsx scripts/seed.ts
// Wymagane env: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_USER_EMAIL, SEED_USER_PASSWORD
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEMO_EMAIL = process.env.SEED_USER_EMAIL ?? 'demo@pacjentwybiera.pl';
const DEMO_PASSWORD = process.env.SEED_USER_PASSWORD ?? 'Demo1234!';

const MENU_API = 'https://pacjentwybiera.pl/wp-json/mobilnycatering/v1/menu-schedules';

type MealStatus = 'eaten' | 'partial' | 'not_eaten';

// Scenariusz: Anna Kowalska, rak piersi, chemioterapia 3 dni temu
// Statusy per slot wg kolejności zwracanej przez API (sortOrder 0..6)
//   0=OnkoShot, 1=Śniadanie, 2=II Śniadanie, 3=Koktajl, 4=Obiad, 5=Podwieczorek, 6=Kolacja
//
// Godziny posiłków (wg api.ts):
//   OnkoShot 7:00 | Śniadanie 8:00 | II Śniadanie 10:30 | Koktajl 12:00
//   Obiad 13:00   | Podwieczorek 16:00 | Kolacja 19:00
// Objawy ustawione ~30–60 min po posiłkach żeby timeline pokazywała związek przyczynowy.
const SCENARIOS: Record<number, {
  statuses: MealStatus[];
  partials: (number | null)[];
  symptoms: { key: string; scale: number; hour: number; minute: number; note?: string }[];
}> = {
  [-5]: {
    // 2 dni przed chemią — dobra forma, chronicznie lekkie zmęczenie
    statuses: ['eaten', 'eaten', 'eaten', 'eaten', 'eaten', 'partial', 'eaten'],
    partials:  [null,    null,    null,    null,    null,    65,        null],
    symptoms: [
      { key: 'fatigue',  scale: 22, hour: 11, minute: 0  }, // po II Śniadaniu (10:30)
      { key: 'appetite', scale: 18, hour: 13, minute: 45 }, // po Obiedzie (13:00)
    ],
  },
  [-4]: {
    // 1 dzień przed chemią — lekkie objawy narastają
    statuses: ['eaten', 'eaten', 'partial', 'eaten', 'eaten', 'partial', 'not_eaten'],
    partials:  [null,    null,    70,        null,    null,    50,        null],
    symptoms: [
      { key: 'fatigue',  scale: 32, hour: 9,  minute: 0  }, // po Śniadaniu (8:00)
      { key: 'appetite', scale: 28, hour: 14, minute: 15 }, // po Obiedzie (13:00) — mało zjadła
      { key: 'dryness',  scale: 22, hour: 20, minute: 0  }, // po Kolacji (19:00) — suchość w ustach
    ],
  },
  [-3]: {
    // Dzień CHEMII — pierwsze reakcje po posiłkach
    statuses: ['eaten', 'partial', 'eaten', 'partial', 'eaten', 'partial', 'not_eaten'],
    partials:  [null,    60,        null,    55,        null,    50,        null],
    symptoms: [
      { key: 'fatigue', scale: 48, hour: 8,  minute: 0  }, // rano, przed chemią
      { key: 'nausea',  scale: 35, hour: 13, minute: 45, note: 'Po obiedzie, po chemioterapii' }, // po Obiedzie
      { key: 'metal',   scale: 30, hour: 19, minute: 45 }, // po Kolacji (19:00) — metaliczny smak po jedzeniu
    ],
  },
  [-2]: {
    // Najgorszy dzień — silne nudności i metaliczny smak po każdym posiłku
    statuses: ['partial', 'not_eaten', 'eaten', 'not_eaten', 'partial', 'not_eaten', 'partial'],
    partials:  [40,        null,        null,    null,        35,        null,         45],
    symptoms: [
      { key: 'nausea',   scale: 82, hour: 8,  minute: 30, note: 'Silne nudności po próbie śniadania' },
      { key: 'metal',    scale: 72, hour: 11, minute: 0  }, // po II Śniadaniu (10:30)
      { key: 'appetite', scale: 78, hour: 13, minute: 30 }, // w porze obiadu — nie mogła jeść
      { key: 'fatigue',  scale: 65, hour: 16, minute: 45 }, // po Podwieczorku (16:00)
    ],
  },
  [-1]: {
    // Wczoraj — stopniowy powrót do formy, objawy opadają
    statuses: ['eaten', 'partial', 'eaten', 'partial', 'partial', 'eaten', 'not_eaten'],
    partials:  [null,    55,        null,    60,        50,        null,    null],
    symptoms: [
      { key: 'nausea',   scale: 48, hour: 8,  minute: 45 }, // po Śniadaniu (8:00)
      { key: 'metal',    scale: 42, hour: 11, minute: 15 }, // po II Śniadaniu (10:30)
      { key: 'appetite', scale: 52, hour: 14, minute: 0  }, // po Obiedzie (13:00)
      { key: 'fatigue',  scale: 38, hour: 19, minute: 45 }, // po Kolacji (19:00) — wieczorne zmęczenie
    ],
  },
};

interface ApiSlot {
  mealName: string;
  sortOrder: number;
  dishes?: Array<{ dishName: string }>;
}

async function fetchSlotsForDate(dateStr: string): Promise<ApiSlot[] | null> {
  const url = new URL(MENU_API);
  url.searchParams.set('dietId',                '2388');
  url.searchParams.set('dietVariantId',         '4881');
  url.searchParams.set('dietVariantCaloriesId', '18414');
  url.searchParams.set('menuScheduleId',        '7354');
  url.searchParams.set('menuDateAsString',      dateStr);
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json() as { content?: ApiSlot[] };
    return (data.content ?? []).filter(s => s.dishes && s.dishes.length > 0);
  } catch {
    return null;
  }
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Utwórz lub pobierz konto demo przez admin API
  let userId: string;
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existingUser = listData?.users?.find(u => u.email === DEMO_EMAIL);

  if (existingUser) {
    userId = existingUser.id;
    console.log(`✓ Użytkownik istnieje: ${DEMO_EMAIL}`);
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(`Nie można stworzyć użytkownika: ${error?.message}`);
    userId = created.user.id;
    console.log(`✓ Stworzono użytkownika: ${DEMO_EMAIL}`);
  }

  // 2. Upsert profil pacjentki
  await supabase.from('patients').upsert({
    user_id: userId,
    first_name: 'Anna',
    last_name: 'Kowalska',
    sex: 'female',
    birth_year: 1972,
    weight_kg: 63,
    height_cm: 165,
    cancer_type: 'Rak piersi',
    treatment_type: 'chemo',
    allergens: [],
  });
  console.log('✓ Profil pacjentki: Anna Kowalska, rak piersi, chemia');

  // 3. Wyczyść poprzednie dane demo
  await supabase.from('meal_logs').delete().eq('user_id', userId);
  await supabase.from('symptom_entries').delete().eq('user_id', userId);
  console.log('✓ Wyczyszczono stare dane\n');

  // 4. Seeduj 5 dni historii
  const today = new Date();

  for (const dayOffset of [-5, -4, -3, -2, -1] as const) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const scenario = SCENARIOS[dayOffset];

    // Pobierz prawdziwe posiłki z API
    const apiSlots = await fetchSlotsForDate(dateStr);

    if (apiSlots && apiSlots.length > 0) {
      // Posortuj wg sortOrder żeby kolejność była deterministyczna
      const sorted = [...apiSlots].sort((a, b) => a.sortOrder - b.sortOrder);

      for (let i = 0; i < sorted.length; i++) {
        const slot = sorted[i];
        const status = scenario.statuses[i] ?? 'eaten';
        const partial_pct = status === 'partial' ? (scenario.partials[i] ?? 50) : null;
        const orderedAt = new Date(d);
        orderedAt.setHours(7, 0, 0, 0);

        await supabase.from('meal_logs').insert({
          user_id: userId,
          date: dateStr,
          meal_slot: slot.mealName,        // ← pasuje do m.title w PlanScreen
          meal_name: slot.dishes![0].dishName,
          option_index: 0,
          status,
          partial_pct,
          ordered_at: orderedAt.toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      console.log(`✓ ${dateStr} — ${sorted.length} posiłków z API`);
    } else {
      // Fallback gdy API niedostępne
      const fallback = ['OnkoShot', 'Śniadanie', 'II Śniadanie', 'Koktajl', 'Obiad', 'Podwieczorek', 'Kolacja'];
      for (let i = 0; i < fallback.length; i++) {
        const status = scenario.statuses[i] ?? 'eaten';
        const partial_pct = status === 'partial' ? (scenario.partials[i] ?? 50) : null;
        const orderedAt = new Date(d);
        orderedAt.setHours(7, 0, 0, 0);

        await supabase.from('meal_logs').insert({
          user_id: userId,
          date: dateStr,
          meal_slot: fallback[i],
          meal_name: `Posiłek (${fallback[i]})`,
          option_index: 0,
          status,
          partial_pct,
          ordered_at: orderedAt.toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      console.log(`✓ ${dateStr} — 7 posiłków (fallback, API niedostępne)`);
    }

    // Objawy dla tego dnia
    for (const sym of scenario.symptoms) {
      const recordedAt = new Date(d);
      recordedAt.setHours(sym.hour, sym.minute, 0, 0);
      await supabase.from('symptom_entries').insert({
        user_id: userId,
        symptom_key: sym.key,
        scale: sym.scale,
        note: sym.note ?? null,
        recorded_at: recordedAt.toISOString(),
      });
    }
    console.log(`  + ${scenario.symptoms.length} objawów`);
  }

  console.log('\n✅ Demo pacjentka gotowa!');
  console.log(`   Email:    ${DEMO_EMAIL}`);
  console.log(`   Hasło:    ${DEMO_PASSWORD}`);
  console.log('   Scenariusz: chemia 3 dni temu, najgorszy dzień -2, dziś powrót do formy');
}

main().catch(console.error);
