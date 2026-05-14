# Plan: Integracja Supabase — PacjentWybiera

## Kontekst

Aplikacja działa na mockowanych danych w `data.ts` i efemerycznym stanie React (objawy i wybory posiłków giną po odświeżeniu). Profil pacjenta jest w `localStorage`. Celem jest persystencja danych potrzebnych do realnych rekomendacji AI: profil pacjenta, historia objawów, zamówienia i statusy spożycia posiłków. Stack: Supabase JS SDK bezpośrednio z frontendu (brak backendu), deploy na GitHub Pages.

---

## Schema Supabase

### Tabela: `patients`
Powiązana 1:1 z `auth.users` przez `user_id`.

| Kolumna         | Typ           | Uwagi                        |
|-----------------|---------------|------------------------------|
| user_id         | uuid (PK, FK) | FK → auth.users.id           |
| first_name      | text          |                              |
| last_name       | text          |                              |
| birth_year      | int4          |                              |
| weight_kg       | numeric       |                              |
| height_cm       | numeric       |                              |
| cancer_type     | text          |                              |
| treatment_type  | text          | chemo/radio/surgery/combined |
| allergens       | text[]        | tablica kluczy alergenów     |
| created_at      | timestamptz   | default now()                |

### Tabela: `symptom_entries`
Historia objawów — serce predykcji AI.

| Kolumna      | Typ         | Uwagi                                    |
|--------------|-------------|------------------------------------------|
| id           | uuid (PK)   | default gen_random_uuid()                |
| user_id      | uuid (FK)   | FK → auth.users.id                       |
| symptom_key  | text        | nausea/diarrhea/const/mouth/taste/...    |
| scale        | int4        | 0–100                                    |
| note         | text        | nullable                                 |
| recorded_at  | timestamptz | timestamp z aplikacji (nie server)       |

### Tabela: `meal_logs`
Zamówienia + status spożycia posiłku. Nie przechowuje wewnętrznych ID slotów — tylko realną nazwę potrawy z API i slot (pora dnia).

| Kolumna      | Typ         | Uwagi                                             |
|--------------|-------------|---------------------------------------------------|
| id           | uuid (PK)   | default gen_random_uuid()                         |
| user_id      | uuid (FK)   | FK → auth.users.id                                |
| date         | date        | data posiłku                                      |
| meal_slot    | text        | Śniadanie / II Śniadanie / Obiad / Podwieczorek / Kolacja / Shake / Shot |
| meal_name    | text        | pełna nazwa potrawy pobrana z realnego API        |
| option_index | int4        | 0 = rekomendowana, 1 = alternatywna               |
| status       | text        | pending / eaten / partial / not_eaten             |
| partial_pct  | int4        | nullable, 0–100 (ile procent zjedzone)            |
| ordered_at   | timestamptz | kiedy złożono zamówienie                          |
| updated_at   | timestamptz | ostatnia zmiana statusu                           |

### SQL — tworzenie tabel i RLS

```sql
-- patients
create table patients (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  birth_year int4,
  weight_kg numeric,
  height_cm numeric,
  cancer_type text,
  treatment_type text,
  allergens text[] default '{}',
  created_at timestamptz default now()
);
alter table patients enable row level security;
create policy "own data only" on patients
  using (user_id = auth.uid());

-- symptom_entries
create table symptom_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_key text not null,
  scale int4 not null check (scale between 0 and 100),
  note text,
  recorded_at timestamptz not null
);
alter table symptom_entries enable row level security;
create policy "own data only" on symptom_entries
  using (user_id = auth.uid());

-- meal_logs
create table meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_slot text not null,
  meal_name text not null,
  option_index int4 not null default 0,
  status text not null default 'pending',
  partial_pct int4,
  ordered_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table meal_logs enable row level security;
create policy "own data only" on meal_logs
  using (user_id = auth.uid());
```

---

## Architektura frontendu

```
frontend/src/
├── lib/
│   └── supabase.ts          # createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── services/
│   ├── auth.ts              # signUp, signIn, signOut, getSession
│   ├── patients.ts          # getPatient, upsertPatient
│   ├── symptoms.ts          # addSymptom, getSymptoms(from, to), deleteSymptom
│   └── mealLogs.ts          # upsertMealLog, getMealLogs(date), updateMealStatus
└── screens/
    ├── LoginScreen.tsx      # nowy ekran — email + hasło
    └── (istniejące ekrany podłączone do services/)
```

Supabase `anon` key jest publiczny (zabezpieczony przez RLS) — bezpieczny na GitHub Pages.

---

## Env vars

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GROQ_API_KEY=gsk_...    # zostaje jak jest
```

Na GitHub Pages: Settings → Secrets → `VITE_*` jako env w workflow.

---

## Kroki implementacji

### 1. Setup Supabase
- Założyć projekt na supabase.com (region EU — Frankfurt, RODO)
- Wykonać SQL schema z sekcji wyżej w SQL Editor
- `npm install @supabase/supabase-js`
- Stworzyć `src/lib/supabase.ts`

### 2. Auth flow
- Dodać `'login'` do `type Screen` w `types.ts`
- Nowy `LoginScreen.tsx` (email + hasło, rejestracja + logowanie w jednym formularzu)
- `App.tsx`: sprawdzać `supabase.auth.getSession()` przy starcie → brak sesji → `'login'`, sesja → load patient
- `supabase.auth.onAuthStateChange(...)` do reaktywnej obsługi

### 3. Service layer
- `services/auth.ts` — wrappery `supabase.auth.signUp / signInWithPassword / signOut`
- `services/patients.ts` — `getPatient()` / `upsertPatient()` (zastępuje localStorage)
- `services/symptoms.ts` — `addSymptomEntry()` / `getSymptomEntries(from, to)` / `deleteSymptomEntry(id)`
- `services/mealLogs.ts` — `upsertMealLog()` / `getMealLogs(date)` / `updateMealStatus(id, status, pct)`

### 4. Podłączenie ekranów

| Ekran | Zmiana |
|-------|--------|
| `App.tsx` | load patient + last-7-days symptoms ze Supabase przy loginie |
| `OnboardingScreen.tsx` | po wypełnieniu → `upsertPatient()` |
| `AddSymScreen.tsx` | `handleSave()` → `addSymptomEntry()` + optimistic update; `handleDelete()` → `deleteSymptomEntry()` |
| `OrderScreen.tsx` | po zatwierdzeniu → `upsertMealLog()` dla każdego posiłku (z `meal_name` z API) |
| `HomeScreen.tsx / MealCard.tsx` | `handleSetMealStatus()` → `updateMealStatus()` |
| `PlanScreen.tsx` | `getMealLogs(date)` zamiast `pastMockDays` z `data.ts` |

### 5. AI — realne dane historyczne
`fetchAiRecommendation()` w `api.ts` dostaje `symptomHistory`. Po podłączeniu ekranów historia będzie realna (załadowana z Supabase przy loginie dla ostatnich 7 dni). Zero zmian w samej logice AI — tylko dane wejściowe stają się prawdziwe.

### 6. Deploy na GitHub Pages
- `vite.config.ts`: `base: '/pacjentwybiera/'`
- `.github/workflows/deploy.yml`: `npm run build` → `actions/deploy-pages`
- Secrets w repozytorium: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GROQ_API_KEY`

---

## Skrypt seedujący — 6 dni przykładowych danych

**Cel:** Skrypt załaduje przykładowe dane historyczne dla wskazanego user_id (lub konta testowego), pobierając **realne nazwy posiłków z API** (`https://pacjentwybiera.pl/wp-json/mobilnycatering/v1/`) dla 6 ostatnich dni.

**Plik:** `scripts/seed.ts` (uruchamiany przez `npx ts-node scripts/seed.ts` lub `tsx`)

```typescript
// scripts/seed.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // service key (nie anon!)
const TEST_USER_EMAIL = process.env.SEED_USER_EMAIL!;
const TEST_USER_PASSWORD = process.env.SEED_USER_PASSWORD!;

const MENU_API = 'https://pacjentwybiera.pl/wp-json/mobilnycatering/v1/menu-schedules';
const DIET_PARAMS = 'dietId=2388&dietVariantId=4881&dietVariantCaloriesId=18414&menuScheduleId=7354';

const SLOT_LABELS = ['Śniadanie', 'II Śniadanie', 'Obiad', 'Podwieczorek', 'Kolacja', 'Shake', 'Shot'];

const SYMPTOMS = ['nausea', 'taste', 'fatigue', 'appetite', 'diarrhea', 'const', 'dryness', 'mouth', 'metal'];

async function fetchMealsForDate(dateStr: string) {
  const res = await fetch(`${MENU_API}?date=${dateStr}&${DIET_PARAMS}`);
  if (!res.ok) return null;
  const data = await res.json();
  // parsowanie identyczne jak w api.ts → fetchMenuForDate()
  // zwraca Meal[] lub null
  return data;
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  // logowanie na konto testowe
  const { data: { user } } = await supabase.auth.signInWithPassword({
    email: TEST_USER_EMAIL,
    password: TEST_USER_PASSWORD,
  });
  if (!user) throw new Error('Login failed');

  const userId = user.id;
  const today = new Date();

  for (let dayOffset = -6; dayOffset <= -1; dayOffset++) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

    // Pobierz realne posiłki z API
    const meals = await fetchMealsForDate(dateStr);
    
    // Seed meal_logs — każdy slot z losowym statusem
    const statuses = ['eaten', 'partial', 'not_eaten', 'eaten', 'eaten', 'partial', 'eaten'];
    const partialPcts = [null, 60, null, null, null, 40, null];
    
    for (let i = 0; i < SLOT_LABELS.length; i++) {
      const mealName = meals?.[i]?.options?.[0]?.name ?? `Posiłek ${SLOT_LABELS[i]}`; // fallback
      await supabase.from('meal_logs').insert({
        user_id: userId,
        date: dateStr,
        meal_slot: SLOT_LABELS[i],
        meal_name: mealName,
        option_index: 0,
        status: statuses[i % statuses.length],
        partial_pct: partialPcts[i % partialPcts.length],
        ordered_at: new Date(d.setHours(7)).toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Seed symptom_entries — 1-3 losowych objawów na dzień
    const daySymptoms = SYMPTOMS.slice(0, 2 + (dayOffset % 2 === 0 ? 1 : 0));
    for (const key of daySymptoms) {
      const hour = 8 + Math.floor(Math.random() * 10);
      const recorded = new Date(d);
      recorded.setHours(hour, Math.floor(Math.random() * 60));
      await supabase.from('symptom_entries').insert({
        user_id: userId,
        symptom_key: key,
        scale: 20 + Math.floor(Math.random() * 60), // 20–80
        note: null,
        recorded_at: recorded.toISOString(),
      });
    }

    console.log(`✓ Seeded ${dateStr}`);
  }

  console.log('Done! 6 days of data loaded.');
}

main().catch(console.error);
```

**Uruchomienie:**
```bash
export VITE_SUPABASE_URL=https://xxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...   # z Supabase Settings → API → service_role
export SEED_USER_EMAIL=testowy@szpital.pl
export SEED_USER_PASSWORD=haslo123
npx tsx scripts/seed.ts
```

> **Uwaga:** Skrypt używa `service_role` key (nie anon), bo omija RLS — uruchamiać tylko lokalnie, nigdy nie commitować klucza.

---

## Pliki do modyfikacji / stworzenia

| Plik | Akcja |
|------|-------|
| `frontend/package.json` | + `@supabase/supabase-js` |
| `frontend/vite.config.ts` | + `base` dla GH Pages |
| `frontend/src/types.ts` | + `'login'` do `Screen` |
| `frontend/src/App.tsx` | auth session check, load patient/symptoms |
| `frontend/src/screens/AddSymScreen.tsx` | save/delete przez services/symptoms.ts |
| `frontend/src/screens/OrderScreen.tsx` | save zamówień przez services/mealLogs.ts |
| `frontend/src/screens/HomeScreen.tsx` | update statusów przez services/mealLogs.ts |
| `frontend/src/screens/PlanScreen.tsx` | load historii z services/mealLogs.ts |
| `frontend/src/screens/OnboardingScreen.tsx` | save profilu przez services/patients.ts |
| `frontend/src/lib/supabase.ts` | **nowy** — createClient |
| `frontend/src/services/auth.ts` | **nowy** |
| `frontend/src/services/patients.ts` | **nowy** |
| `frontend/src/services/symptoms.ts` | **nowy** |
| `frontend/src/services/mealLogs.ts` | **nowy** |
| `frontend/src/screens/LoginScreen.tsx` | **nowy** |
| `scripts/seed.ts` | **nowy** — seeding script |
| `.github/workflows/deploy.yml` | **nowy** — GH Pages deploy |

---

## Weryfikacja end-to-end

1. Rejestracja → profil w tabeli `patients` (Supabase Studio)
2. Dodanie objawu → wiersz w `symptom_entries`
3. Zamówienie → wiersze w `meal_logs` z `meal_name` z realnego API
4. Oznaczenie posiłku jako zjedzonego → `status = 'eaten'` w bazie
5. Odświeżenie strony → dane wracają (historia objawów, statusy)
6. AI rekomendacja → prompt zawiera realną historię z ostatnich 7 dni
7. Logowanie z innego urządzenia → te same dane
8. Seed script → 6 dni danych widocznych w PlanScreen

---

## Uwagi

- **RODO**: Dane medyczne. Supabase projekt ustawić na region EU (Frankfurt).
- **Offline**: Aplikacja wymaga internetu (brak sync offline). Szpital ma WiFi — akceptowalne dla MVP.
- **Groq key**: Zostaje po stronie frontu jako `VITE_GROQ_API_KEY`. Tymczasowe — docelowo Supabase Edge Function.
- **data.ts**: Zostaje jako fallback dla UI deweloperskiego, nie będzie używany przez zalogowanego pacjenta.
