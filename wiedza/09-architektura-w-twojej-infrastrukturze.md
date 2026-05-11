# 09 · Jak model mógłby działać — w Twojej konkretnej infrastrukturze

> Plik mapuje teorię z `08-model-predykcji-cechy.md` na **realny stos technologiczny projektu PacjentWybiera**: React+Ionic frontend, FastAPI backend, MongoDB, ChromaDB, oraz API `pacjentwybiera.pl/wp-json/mobilnycatering/v1/menu-schedules`.

## TL;DR

Masz **niezwykle dobre fundamenty**. Twój stack już zawiera wszystkie 3 elementy potrzebne do nietrywialnego modelu rekomendacyjno-predykcyjnego:

1. **Reguły deterministyczne** — możliwe do zaimplementowania w TypeScript po stronie frontendu (`utils.ts`) lub w FastAPI.
2. **Klasyfikacja / ranker (LightGBM)** — FastAPI ma do tego idealne warunki, MongoDB jako event store.
3. **Wyszukiwanie semantyczne / RAG** — masz już **ChromaDB** w `docker-compose.yml` (port `8001:8000`).

Brakuje **3 elementów**:

- Kolekcji `meal_episodes` w MongoDB (logowanie spożytych posiłków + feedback).
- Endpointów FastAPI (`POST /recommendations`, `POST /episodes`, `GET /wellbeing-prediction`).
- Pierwszego załadowania bazy wiedzy (`wiedza/*.md`) i menu do **ChromaDB jako embedingi**.

---

## 1. Mapowanie wiedzy ↔ Twojej infrastruktury

| Element wiedzy | Twoja infrastruktura | Status |
|----------------|----------------------|--------|
| 13 objawów z `02-objawy-i-postepowanie.md` | `SymptomKey` w `frontend/src/types.ts` | ⚠️ Masz 9 z 13 — trzeba dorobić |
| Tagi posiłków z `03-produkty-zalecane-i-przeciwwskazane.md` | `Tag[]` w `MealOption` + flagi z API (`highProtein`, `easilyDigestible`, ...) | ⚠️ API ma flagi, ale wszystkie `false` w obecnym menu — trzeba samodzielnie tagować |
| Konsystencje z `04-konsystencje-i-warianty-diety.md` | brak | ❌ Do dodania (`consistency` w `MealOption`) |
| Warianty diety (radio-chemio, leczenie, remisja) | `treatmentType` w `PatientProfile` (chemo/radio/surgery/combined) | ✅ Pasuje |
| Zakaz grejpfruta i in. | brak | ❌ Hard constraint do dodania w backendzie |
| 5 jadłospisów z `07-jadlospisy-przykladowe.md` | hardcoded `meals[]` w `data.ts` | ✅ Częściowo — można rozszerzyć |
| Cechy pacjenta z `08-model-predykcji-cechy.md` | `PatientProfile` (firstName, lastName, weight, height, cancerType, treatmentType, allergens) | ⚠️ Brakuje: BMI, dzień_cyklu_chemio, choroby_współistniejące |
| Stan dynamiczny (objawy, samopoczucie) | `symptoms`, `wellbeing` w `App.tsx` | ✅ Już masz |
| `eatenMap` (czy zjedzono posiłek) | jest w `App.tsx` | ✅ Pierwszy element feedback loop |

### Kluczowe spostrzeżenie

Twoja aplikacja ma już **trzy najważniejsze sygnały** dla modelu:
1. `choices` — co pacjent wybrał z menu,
2. `eatenMap` — czy zjadł,
3. `wellbeing` + `symptoms` — jak się czuł.

To jest dokładnie schemat `meal_episode` z `08-model-predykcji-cechy.md`. **Brakuje tylko persystencji** (MongoDB) i **drugiego pomiaru** samopoczucia (2–4 h **po** posiłku).

---

## 2. Architektura — 3 warstwy w Twoim stacku

```
┌──────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + Ionic, port 5173)                                 │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ App.tsx: stan(symptoms, wellbeing, choices, eatenMap, patient) │  │
│  │   ├─→ HomeScreen, OrderScreen (swipe), AddSymScreen            │  │
│  │   └─→ api.ts: fetchMenuForDate() → pacjentwybiera.pl API       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ↕ REST                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ NEW: api/recommendations.ts  → POST /v1/recommendations         │  │
│  │ NEW: api/episodes.ts         → POST /v1/episodes                │  │
│  │ NEW: api/feedback.ts         → POST /v1/episodes/:id/feedback   │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                   ↕
┌──────────────────────────────────────────────────────────────────────┐
│  BACKEND (FastAPI, port 8000)                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ WARSTWA 1 — REGUŁY (deterministyczna)                          │  │
│  │   rules/hard_constraints.py:                                   │  │
│  │     - HARD_CONSTRAINTS_CHEMO = ["grejpfrut", "pomelo", ...]    │  │
│  │     - filter_unsafe(meal, patient) → bool                      │  │
│  │   rules/symptom_rules.py:                                      │  │
│  │     - symptom_score(meal, symptoms) → float                    │  │
│  │     - load_from: ../wiedza/02-objawy-i-postepowanie.md         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ WARSTWA 2 — RANKER (LightGBM)                                  │  │
│  │   models/ranker.py:                                            │  │
│  │     - features = encode_patient(p) ⊕ encode_meal(m)            │  │
│  │     - score = lgb_model.predict(features)                      │  │
│  │     - cold start: jeśli <100 epizodów → reguły dominują         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ WARSTWA 3 — PREDYKCJA SAMOPOCZUCIA (LightGBM Regressor)        │  │
│  │   models/wellbeing.py:                                         │  │
│  │     - input: posiłek + objawy_przed                            │  │
│  │     - output: oczekiwane Δsamopoczucie [-2..+2]                │  │
│  │     - explainability: SHAP values                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                              ↓                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ WARSTWA 0 — RAG / EMBEDDINGS (ChromaDB)                        │  │
│  │   chroma_collections:                                          │  │
│  │     - "knowledge_base"  ← wiedza/*.md (chunked)                │  │
│  │     - "meals_catalog"   ← skład + tagi posiłków                │  │
│  │   - generuje "why" dla rekomendacji (cytat z wiedzy)           │  │
│  │   - similarity search: "posiłki podobne do X"                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
                                   ↕
┌──────────────────────────────────────────────────────────────────────┐
│  PERSYSTENCJA                                                         │
│  ┌─────────────────────────┐  ┌──────────────────────────────────┐   │
│  │ MongoDB (port 27017)    │  │ ChromaDB (port 8001:8000)        │   │
│  │  ├ patients             │  │  ├ knowledge_base (wiedza/*.md)  │   │
│  │  ├ meal_episodes ←NEW   │  │  ├ meals_catalog                 │   │
│  │  ├ symptom_logs ←NEW    │  │  └ patient_history (opcjonalnie) │   │
│  │  └ daily_wellbeing ←NEW │  │                                  │   │
│  └─────────────────────────┘  └──────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 3. Konkretny przepływ jednego dnia pacjenta

### 8:00 — pacjent otwiera aplikację
1. `WelcomeScreen` pyta: „Jak się czujesz dziś?" → `wellbeing: 1–10` zapisywane do MongoDB jako `daily_wellbeing` doc.
2. `AddSymScreen` pyta o objawy → multi-select 13 objawów. **Dziś masz 9 — trzeba dodać 4**: `dysfagia`, `wzdecia`, `niedozywienie` (flag), `niechec_do_miesa`.
3. Frontend wywołuje:
   ```ts
   POST /v1/recommendations
   {
     patient_id: "abc123",
     symptoms: ["nudnosci_wymioty", "brak_apetytu"],
     wellbeing_now: 4,
     date: "2026-05-13"
   }
   ```

### Backend mieli:
1. **Pobiera menu** z `pacjentwybiera.pl` API (lub używa cache w MongoDB).
2. **Warstwa 1**: filtruje twardymi regułami:
   - jeśli pacjent ma `chemioterapia` w `treatmentType` i posiłek zawiera `grejpfrut`, `pomelo`, `granat` w `ingredientsName` → odrzuć,
   - jeśli alergeny pacjenta przecinają `allergensText` posiłku → odrzuć,
   - wynik: lista posiłków „dopuszczalnych".
3. **Warstwa 2**: ranker LightGBM (lub w fazie 0 — system reguł) liczy `score` dla każdego dopuszczalnego posiłku.
4. **Warstwa 3**: dla TOP 3 oblicza przewidywane `Δwellbeing` i ostrzeżenia.
5. **Warstwa 0**: ChromaDB znajduje cytat z `wiedza/*.md` uzasadniający rekomendację (np. „Przy nudnościach posiłki o temperaturze pokojowej zmniejszają stymulację ośrodka węchowego" — z `02-objawy-i-postepowanie.md`).
6. Zwraca:
   ```json
   {
     "slots": [
       {
         "slot_id": "breakfast",
         "options": [
           { "meal_id": "...", "score": 8.7, "delta_wellbeing_pred": +0.4,
             "why": "Łagodny smak, temperatura pokojowa — wspiera przy nudnościach. Wysokobiałkowe (19g).",
             "evidence_citation": "wiedza/02-objawy-i-postepowanie.md#nudnosci_wymioty",
             "warnings": [] },
           { "meal_id": "...", "score": 5.2, "delta_wellbeing_pred": -0.3,
             "why": "Omlet z bananem — białko OK, ale ciepłe danie może nasilać nudności.",
             "warnings": ["zapach_intensywny"] }
         ]
       }
     ]
   }
   ```

### 8:30 — pacjent wybiera śniadanie (swipe w `OrderScreen`)
- `choices['breakfast'] = 0` — frontend zapisuje wybór i ratuje to do `meal_episodes`:
  ```ts
  POST /v1/episodes
  { patient_id, meal_id, slot: "breakfast", offered_at: "...", chosen_option_idx: 0,
    symptoms_before: [...], wellbeing_before: 4 }
  ```
- MongoDB → `meal_episodes` dokument o stanie `offered`.

### 9:30 — pacjent zjadł
- `eatenMap['breakfast'] = 'full'` → frontend update'uje epizod:
  ```ts
  PATCH /v1/episodes/{id} { consumed_pct: 100, consumed_at: "..." }
  ```

### 11:30 — push notification + ankieta
- „Jak się czujesz po śniadaniu? Czy wystąpiły jakieś objawy?"
- `1–5` + multi-select objawów obecnych:
  ```ts
  POST /v1/episodes/{id}/feedback
  { wellbeing_after: 5, symptoms_after: ["lekkie_nudnosci"] }
  ```

### Tydzień później — retrening modelu
- Cron job w backendzie wywołuje `models/train.py`:
  - Czyta z MongoDB wszystkie epizody z `consumed_pct > 0` i `feedback != null`.
  - Trenuje LGBMRegressor na `Δwellbeing = wellbeing_after - wellbeing_before`.
  - Trenuje LGBMRanker na `score = consumed_pct/100 + 0.2 * normalized(wellbeing_after)`.
  - Zapisuje model do `/models/` i podmienia w pamięci FastAPI (lifespan).

---

## 4. Schematy MongoDB (do dodania)

### `patients` (rozszerzyć obecny `PatientProfile`)
```python
class PatientDoc(BaseModel):
    _id: ObjectId
    user_id: str               # auth ID
    first_name: str
    last_name: str
    birth_year: int
    weight_kg: float
    height_cm: float
    bmi: float                 # wyliczane
    cancer_type: str
    cancer_stage: Literal["I","II","III","IV"] | None
    treatment_type: Literal["chemo","radio","surgery","combined",""]
    chemo_protocol: str | None    # np. "FOLFOX"
    chemo_cycle_day: int | None   # NEW: dzień od ostatniego wlewu
    comorbidities: list[str]      # NEW: cukrzyca, nadcisnienie, ...
    allergens: list[str]
    food_exclusions: list[str]    # NEW: weganizm, halal, ...
    lactose_intolerance: bool     # NEW: aktualna (zmienna w czasie)
    flag_malnutrition: bool       # NEW: BMI<18.5 lub spadek wagi >5%/mies.
    weight_history: list[WeightEntry]  # NEW: do liczenia delta_wagi
    created_at: datetime
    updated_at: datetime
```

### `meal_episodes` (nowa kolekcja — rdzeń systemu uczenia)
```python
class MealEpisodeDoc(BaseModel):
    _id: ObjectId
    patient_id: ObjectId
    date: str                   # "2026-05-13"
    slot: Literal["breakfast","lunch2","dinner","snack","supper","shake","shot"]
    meal_id: str                # ID z menu API
    chosen_option_idx: int      # 0 lub 1 (rec/alt)
    meal_snapshot: dict         # cały Dish z API zatrzaśnięty
    
    offered_at: datetime
    consumed_at: datetime | None
    consumed_pct: int | None    # 0..100
    
    symptoms_before: list[str]
    wellbeing_before: int       # 1..10
    
    feedback_at: datetime | None
    symptoms_after: list[str] | None
    wellbeing_after: int | None # 1..10
    
    delta_wellbeing: int | None # wellbeing_after - wellbeing_before (compute on write)
    
    # snapshoty cech do treningu (zatrzaśnięte żeby nie było data drift)
    patient_features_snapshot: dict
    rules_score: float          # co policzył system reguł
    model_score: float | None   # co policzył ML
```

### `daily_wellbeing` (nowa)
```python
class DailyWellbeingDoc(BaseModel):
    _id: ObjectId
    patient_id: ObjectId
    date: str
    wellbeing_morning: int          # 1..10
    wellbeing_evening: int | None
    symptoms_morning: list[str]
    symptoms_evening: list[str] | None
    notes: str | None
```

---

## 5. Endpointy FastAPI do dodania

```python
# backend/main.py (rozszerzenie)

from fastapi import APIRouter, HTTPException
from .schemas import RecommendationRequest, RecommendationResponse, EpisodeCreate, FeedbackCreate

api = APIRouter(prefix="/v1")

@api.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(req: RecommendationRequest):
    """Zwraca posiłki dla wszystkich slotów dnia, posortowane przez 3-warstwowy pipeline."""
    patient = await db.patients.find_one({"_id": req.patient_id})
    menu    = await fetch_menu(req.date)  # cache w MongoDB
    
    out = []
    for slot in menu:
        # Warstwa 1
        safe_options = [o for o in slot.options if filter_hard_constraints(o, patient)]
        # Warstwa 2
        scored = [(o, ranker.score(patient, o, req.symptoms, req.wellbeing_now))
                  for o in safe_options]
        # Warstwa 3
        scored = [(o, s, wellbeing_predictor.predict_delta(patient, o, req.symptoms))
                  for o, s in scored]
        # Sort + top-K
        scored.sort(key=lambda x: x[1], reverse=True)
        out.append(slot_to_response(slot, scored))
    return {"slots": out}

@api.post("/episodes")
async def create_episode(payload: EpisodeCreate):
    doc = build_episode_doc(payload)
    res = await db.meal_episodes.insert_one(doc)
    return {"episode_id": str(res.inserted_id)}

@api.patch("/episodes/{episode_id}")
async def update_episode(episode_id: str, payload: dict):
    await db.meal_episodes.update_one({"_id": ObjectId(episode_id)}, {"$set": payload})
    return {"ok": True}

@api.post("/episodes/{episode_id}/feedback")
async def submit_feedback(episode_id: str, payload: FeedbackCreate):
    delta = payload.wellbeing_after - episode["wellbeing_before"]
    await db.meal_episodes.update_one(
        {"_id": ObjectId(episode_id)},
        {"$set": {**payload.dict(), "delta_wellbeing": delta, "feedback_at": datetime.utcnow()}},
    )
    # opcjonalnie: trigger online learning
    return {"ok": True}

@api.get("/wellbeing-prediction")
async def predict_wellbeing(patient_id: str, meal_id: str, symptoms: list[str]):
    """Co-if: pokaż przewidywane samopoczucie po danym posiłku."""
    return wellbeing_predictor.predict(patient_id, meal_id, symptoms)

@api.get("/knowledge/search")
async def search_knowledge(q: str, k: int = 3):
    """RAG: wyszukaj cytaty z bazy wiedzy (ChromaDB)."""
    results = chroma_client.get_collection("knowledge_base").query(
        query_texts=[q], n_results=k
    )
    return {"chunks": results}

app.include_router(api)
```

---

## 6. ChromaDB — wykorzystanie tego, co już masz

Twój `docker-compose.yml` ma już ChromaDB na porcie `8001:8000`. To **kluczowe** — pozwala na:

### A. RAG dla uzasadnień rekomendacji
```python
# scripts/index_knowledge.py — uruchamiany jednorazowo / przy zmianie wiedzy
import chromadb, glob
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

client = chromadb.HttpClient(host="chroma", port=8000)
ef = SentenceTransformerEmbeddingFunction(model_name="BAAI/bge-m3")  # multilingual, dobre PL
col = client.get_or_create_collection("knowledge_base", embedding_function=ef)

for path in glob.glob("wiedza/*.md"):
    with open(path) as f:
        text = f.read()
    # chunkowanie po nagłówkach H2/H3
    for i, chunk in enumerate(split_by_headers(text)):
        col.add(
            ids=[f"{path}#{i}"],
            documents=[chunk.text],
            metadatas=[{"source": path, "section": chunk.heading, "symptom": extract_symptom_key(chunk)}]
        )
```

Dzięki temu API rekomendacji może zwracać `evidence_citation` — fragment z bazy wiedzy uzasadniający wybór. **Pacjent widzi „dlaczego"**, dietetyk ma audyt, model ma wyjaśnialność.

### B. Wyszukiwanie podobnych posiłków
```python
# meals_catalog: każdy posiłek z menu API jest osadzany jako embedding
col_meals = client.get_or_create_collection("meals_catalog")
col_meals.add(
    ids=[meal["dishName"]],
    documents=[f"{meal['dishName']} | {meal['ingredientsName']} | {meal['allergens']}"],
    metadatas=[{**boolean_flags, "kcal": meal["kcal"], "protein_g": meal["protein"]}]
)
```

To umożliwia:
- *„podobne posiłki do tego, który mu smakował"* (collaborative filtering bez PII),
- *„czy to danie jest podobne do czegoś, co mu nie smakowało"*.

### C. Pamięć preferencji pacjenta
```python
# col_patient_history — opcjonalnie, dla personalizacji
col.add(
    ids=[episode_id],
    documents=[meal_description],
    metadatas={"patient_id": hash(patient_id), "delta_wellbeing": delta, "consumed_pct": pct}
)
```

Przy następnej rekomendacji: query po `patient_id` + dystans cosine → już mamy ranking preferencji.

---

## 7. Co konkretnie należy zmienić w istniejącym kodzie

### `frontend/src/types.ts` — rozszerzyć `SymptomKey` i `MealOption`
```ts
// PRZED:
export type SymptomKey =
  | 'nausea' | 'taste' | 'diarrhea' | 'mouth' | 'const'
  | 'fatigue' | 'appetite' | 'dryness' | 'metal';

// PO (dopasowane do wiedzy/02):
export type SymptomKey =
  | 'nudnosci_wymioty'      // dawne 'nausea'
  | 'zmiana_smaku'          // dawne 'taste'
  | 'biegunka'              // dawne 'diarrhea'
  | 'zapalenie_jamy_ustnej' // dawne 'mouth'
  | 'zaparcia'              // dawne 'const'
  | 'zmeczenie'             // dawne 'fatigue'
  | 'brak_apetytu'          // dawne 'appetite'
  | 'suchosc_jamy_ustnej'   // dawne 'dryness'
  | 'posmak_metaliczny'     // dawne 'metal'
  | 'dysfagia'              // NOWY
  | 'wzdecia'               // NOWY
  | 'niechec_do_miesa'      // NOWY
  | 'niedozywienie';        // flaga (NOWY)

export interface MealOption {
  // ... istniejące pola
  
  // NOWE — strukturalne tagi do modelu, niezależne od `tags: Tag[]` (które są tylko UI)
  consistency: 'standardowa' | 'lekkostrawna' | 'papkowata' | 'plynna_wzmocniona' | 'plynna' | 'krem';
  taste_profile: ('neutralny'|'slodki'|'slony'|'kwasny'|'gorzki'|'umami')[];
  aromatic_intensity: 1 | 2 | 3;
  contraindicated_for: SymptomKey[];
  recommended_for: SymptomKey[];
  contains_products: string[];        // klucze z wiedzy/03
  hard_block_for_treatments: ('chemo'|'radio'|'immuno'|'hormonal')[];  // np. grejpfrut → ['chemo']
}

export interface PatientProfile {
  // ... istniejące pola
  
  // NOWE — stan kliniczny dynamiczny
  bmi: number;                      // wyliczane z weightKg + heightCm
  chemoCycleDay?: number;           // 0 = dzień wlewu, rośnie codziennie
  comorbidities: string[];          // 'cukrzyca' | 'nadcisnienie' | ...
  lactoseIntolerance: boolean;
  flagMalnutrition: boolean;
}
```

### `frontend/src/api.ts` — dodać klienta do własnego backendu
```ts
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8000';

export async function getRecommendations(req: {
  patientId: string; date: string; symptoms: SymptomKey[]; wellbeingNow: number;
}): Promise<RecommendationResponse> {
  const res = await fetch(`${BACKEND}/v1/recommendations`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(req),
  });
  return res.json();
}

export async function logEpisode(...) { /* POST /v1/episodes */ }
export async function submitFeedback(...) { /* POST /v1/episodes/:id/feedback */ }
```

### `frontend/src/App.tsx` — dodać feedback timer
- Po `eatenMap[slot] = 'full'` zaplanuj **lokalne powiadomienie po 2 h** (Capacitor Local Notifications).
- W tym momencie pokaż modal: „Jak się czujesz po śniadaniu?" → zapisz feedback przez `submitFeedback()`.

### `backend/main.py` — fundament jest gotowy, dodaj routery
- Stwórz `backend/routers/recommendations.py`, `episodes.py`, `knowledge.py`.
- Dodaj `models/ranker.py` (LightGBM), `rules/engine.py` (deterministyczne reguły z `wiedza/02`).
- Zindexuj `wiedza/*.md` do ChromaDB (jednorazowy skrypt + healthcheck przy starcie).

---

## 8. Roadmap dopasowany do tego, co masz

### Faza 0 — w 1 tygodniu (bez ML, bez retreningu)
**Cel:** zacząć zbierać dane.
1. ⏱ 2h — Rozszerz `SymptomKey` w `types.ts` do 13 objawów (mapping objaw → klucz wiedzy).
2. ⏱ 4h — Dodaj kolekcje `patients`, `meal_episodes`, `daily_wellbeing` w MongoDB + Pydantic schemas.
3. ⏱ 4h — Endpointy `POST /v1/episodes`, `PATCH /v1/episodes/:id`, `POST /v1/episodes/:id/feedback`.
4. ⏱ 4h — Frontend: po `eatenMap[slot] = 'full'` → planowane powiadomienie + modal feedbacku.
5. ⏱ 2h — Endpoint `POST /v1/recommendations` zwraca **dotychczasową kolejność z `data.ts` / API** (placeholder).

**Output po fazie 0:** zbierasz pierwsze epizody. Aplikacja działa identycznie z punktu widzenia UX.

### Faza 1 — silnik reguł (2 tygodnie)
**Cel:** zacząć rekomendować zgodnie z wiedzą.
1. ⏱ 8h — Tagger posiłków: skrypt który wczytuje menu z API + porównuje `ingredientsName` z słownikiem produktów z `wiedza/03` → wypełnia `consistency`, `contains_products`, `recommended_for`, `contraindicated_for`. Wynik do ChromaDB jako `meals_catalog`.
2. ⏱ 8h — `rules/engine.py`:
   - Hard constraints (grejpfrut, alergeny, laktoza, BEZWZGLĘDNIE z `wiedza/03`).
   - `symptom_score(meal, symptoms)` — punktacja z `wiedza/02`.
3. ⏱ 4h — `POST /v1/recommendations` zwraca rzeczywiste rekomendacje.
4. ⏱ 4h — `evidence_citation` z ChromaDB (RAG: chunk z `wiedza/02` cytowany w odpowiedzi).
5. ⏱ 2h — Frontend wyświetla `evidence_citation` w `OrderScreen` jako rozwijany szczegół „Dlaczego?".

**Output po fazie 1:** pełna deterministyczna rekomendacja, audytowalna, oparta wprost na wiedzy.

### Faza 2 — ML ranker (po zebraniu ~500 epizodów, ~2 miesiące)
1. ⏱ 1d — Notatnik treningowy: load epizody, feature engineering (interakcje z `wiedza/08`).
2. ⏱ 1d — LightGBM Ranker, walidacja per-pacjent (group-aware split).
3. ⏱ 0.5d — Dockerfile rozszerzony o ml dependencies (`lightgbm`, `scikit-learn`, `numpy`, `pandas`).
4. ⏱ 0.5d — Endpoint inference w FastAPI (load model w `lifespan`).
5. ⏱ 1d — A/B test: 50% pacjentów dostaje ranking z reguł, 50% z ML — porównaj `consumed_pct` i `delta_wellbeing`.

### Faza 3 — predykcja samopoczucia (równolegle z fazą 2)
- LGBMRegressor na `delta_wellbeing` z dataframe epizodów.
- Endpoint `GET /v1/wellbeing-prediction`.
- W aplikacji: subtelny indykator obok każdej opcji posiłku („Możesz poczuć się: 🙂 lekko lepiej").
- SHAP values dostępne dla dietetyka (panel admin).

### Faza 4 — personalizacja (po 6+ miesiącach)
- Embedding pacjenta (two-tower model).
- Online learning z feedbacku.

---

## 9. Co jest „darmowe" dzięki Twojej obecnej architekturze

| Funkcja | Bo masz... |
|---------|-----------|
| RAG dla uzasadnień rekomendacji | **ChromaDB** już w docker-compose |
| Skalowalna baza pacjentów | **MongoDB** (motor async) |
| Rekomendacje real-time bez bazy danych | API `pacjentwybiera.pl` daje dane menu |
| Dziedzinowo-spójny słownik | **`wiedza/*.md` z keyami `snake_case`** |
| Hot reload modelu | **FastAPI lifespan** + volume w docker-compose |
| Bezpieczne secrety | **`.env` + pydantic-settings** |
| CORS dla frontu | już skonfigurowany |
| Już logujesz `eatenMap`, `wellbeing`, `symptoms` | wystarczy persystencja |

---

## 10. Pułapki i rzeczy, na które trzeba uważać

1. **Symptom drift.** Pacjent klika tylko aktualnie najbardziej dokuczliwy objaw. Trzeba pytać o **wszystkie** w `AddSymScreen`, inaczej model uczy się na cenzurowanych etykietach.
2. **Selekcja w kierunku „rec=true".** Twój `score` w `data.ts` jest hardcodowany jako 8/6/9/6 itp. — model będzie się uczyć tych etykiet zamiast preferencji pacjenta. **Zignoruj ten field przy treningu.** Trenuj tylko na realnym `consumed_pct` i `delta_wellbeing`.
3. **Cold start.** Pierwsze 100–500 epizodów: model będzie zły. **Trzymaj zwykłe reguły jako fallback** (warstwa 1+2 reguł > warstwa 2 ML jeśli pewność modelu < próg).
4. **RODO / dane medyczne.** `meal_episodes` zawiera dane wrażliwe. Anonimizuj `patient_id` przy treningu (hash + sól). Zaszyfruj dump bazy do treningu offline.
5. **Cytrusy w jadłospisie Lublin 2019.** W `wiedza/07-jadlospisy-przykladowe.md` (Dzień 4) pojawia się sok pomarańczowy — to jest niezgodne z zakazem cytrusów w trakcie chemioterapii (`wiedza/03`). Filtr Warstwy 1 musi mieć wyższy priorytet niż „złoty standard" jadłospisów.
6. **Flagi z API są `false`.** `easilyDigestible`, `highProtein` itp. zwracane są zawsze `false` w obecnym menu. **Nie polegaj na nich** — tagger musi sam wyznaczać te flagi z `ingredientsName`.
7. **Brak danych negatywnych.** Pacjent zwykle wybiera coś. Brak „pominiętego" posiłku to słaby sygnał. Rozważ feedback `pominęłem`/`zjadłem mniej niż połowę` jako jawną etykietę negatywną.
8. **`treatmentType` ma 5 wartości, ale chemoterapia + radioterapia ≠ `combined`.** Lepiej zamienić na multi-hot: `["chemo", "radio"]`.

---

## 11. Najprostszy "mózg" jaki możesz dać aplikacji JUTRO

Bez backendu, bez ML — czysty TypeScript w `utils.ts`:

```ts
// utils.ts (rozszerzenie)
import type { MealOption, SymptomKey } from './types';

const HARD_BLOCK_INGREDIENTS_CHEMO = [
  'grejpfrut','grapefruit','pomelo','granat','dziurawiec','tatar','sushi'
];

const SYMPTOM_PREF: Record<SymptomKey, { boost: string[]; penalty: string[] }> = {
  nudnosci_wymioty: {
    boost:   ['imbir','cytryna','mięta','krakers','suchar','tost','galaretka','mus'],
    penalty: ['tłusty','tłuste','smażony','smażone','kalafior','brokuł','kapusta','cebula','czosnek'],
  },
  biegunka: {
    boost:   ['ryż','banan','jabłko pieczone','tost','marchew gotowana','kasza manna'],
    penalty: ['mleko','śmietana','kawa','surow','grube','pełnoziarnist','kalafior','brokuł'],
  },
  zaparcia: {
    boost:   ['kefir','śliwka','siemie lniane','otręby','pęczak','gryczana','kompot z suszonych'],
    penalty: ['kakao na wodzie','ryż biały','manna','marchew gotowana'],
  },
  zapalenie_jamy_ustnej: {
    boost:   ['banan','melon','serek homo','jogurt','budyń','mus','puree','mleko'],
    penalty: ['imbir','cynamon','kardamon','goździk','ostr','pikantn','kwaśny','grejpfrut','porzeczka'],
  },
  // ... 9 pozostałych — patrz wiedza/02
  zmiana_smaku: { boost: ['cytryna','limonka','ocet balsam','mięta','sorbet','mrożon'], penalty: [] },
  brak_apetytu: { boost: ['masło','oliwa','awokado','orzechy','żółtko','mleko kokosowe','koktajl'], penalty: [] },
  suchosc_jamy_ustnej: { boost: ['sos','jogurt','zupa','mus','jacht'], penalty: ['suchar suchy','krakers solo'] },
  dysfagia: { boost: ['krem','puree','jogurt','mus','budyń','kisiel'], penalty: ['suchy','łykowat','twardy'] },
  zaparcia: { boost: ['błonnik','siemię','otręby','śliwki suszone'], penalty: [] },
  wzdecia: { boost: ['mięta','koper'], penalty: ['kalafior','brokuł','kapusta','groch','soczewica','cebula','czosnek','sok z buraka'] },
  zmeczenie: { boost: ['kalori','białko','koktajl'], penalty: [] },
  posmak_metaliczny: { boost: ['cytryna','mięta','kwaśny'], penalty: [] },
  niechec_do_miesa: { boost: ['jajko','jajka','jajecznica','twarożek','jogurt','tofu','soczewica'], penalty: ['mięso','wołowina','schab'] },
  niedozywienie: { boost: ['masło','oliwa','awokado','orzechy','śmietan','żółtko','koktajl'], penalty: [] },
};

export function rankMealOption(opt: MealOption, symptoms: SymptomKey[], patient: PatientProfile): number {
  const text = `${opt.name} ${opt.ingredients ?? ''}`.toLowerCase();
  
  // Warstwa 1 — hard block
  if (patient.treatmentType === 'chemo' || patient.treatmentType === 'combined') {
    if (HARD_BLOCK_INGREDIENTS_CHEMO.some(x => text.includes(x))) return -Infinity;
  }
  if (patient.allergens.some(a => (opt.allergensText ?? '').toLowerCase().includes(a.toLowerCase()))) {
    return -Infinity;
  }
  
  // Warstwa 2 — soft scoring
  let score = 5;
  for (const s of symptoms) {
    const pref = SYMPTOM_PREF[s];
    if (!pref) continue;
    score += pref.boost.filter(k => text.includes(k)).length * 1.5;
    score -= pref.penalty.filter(k => text.includes(k)).length * 2;
  }
  
  // Boost dla wysokobiałkowych przy niedozywieniu
  if (symptoms.includes('niedozywienie') && opt.protein >= 20) score += 2;
  
  return score;
}
```

**To 80 linii kodu** — możesz to wdrożyć dziś, podmienić obecny hardcodowany `score` na obliczany dynamicznie, i już masz **rekomendację dopasowaną do objawów pacjenta**, w pełni zgodną z bazą wiedzy. Bez ML, bez backendu, bez treningu.

To jest też idealny **baseline** — każda kolejna wersja z ML musi pokonać tę prostą regułę w A/B teście.

---

## Bibliografia plików powiązanych

- `wiedza/02-objawy-i-postepowanie.md` — reguły objaw → dieta (źródło `SYMPTOM_PREF`)
- `wiedza/03-produkty-zalecane-i-przeciwwskazane.md` — słownik produktów (źródło tagów)
- `wiedza/08-model-predykcji-cechy.md` — teoria modelu (skąd wzięła się architektura 3-warstwowa)
- `frontend/src/types.ts` — kontrakt domeny (do rozszerzenia)
- `frontend/src/data.ts` — przykładowe posiłki + tagi (do retagowania)
- `frontend/src/api.ts` — klient menu (zostaje, dodajemy klienta backendu)
- `backend/main.py` — fundament FastAPI + Mongo + Chroma (do rozszerzenia o routery)
- `backend/docker-compose.yml` — działa, **nic nie trzeba zmieniać** (Mongo + Chroma już są)
