# PacjentWybiera — Aplikacja do Zarządzania Strachem Posiłków Onkologicznych

Aplikacja mobilna dla pacjentów onkologicznych szpitala, która:
- Pozwala pacjentom **fotografować pozostałości posiłku**
- Używa **AI (LogMeal API)** do analizy ilości zjedzenia
- Oblicza **brakujące makroskładniki** i **rekomenduje suplementację**
- Śledzenia odżywienia pacjenta w trakcie leczenia

---

## 🎯 Issue #4 — Implementacja Waste Detection

### Problem
Pacjenci mają problem z uzupełnianiem wszystkich makroskładników wymaganych w trakcie leczenia onkologicznego. Manualny logging posiłków jest niedokładny i czasochłonny.

### Rozwiązanie
Zintegrowano **LogMeal API** — narzędzie do analizy obrazów żywności — które:
1. Rozpoznaje produkty i resztki na talerzu
2. Estymuje ich wagę na podstawie zdjęcia
3. Oblicza procent zjedzenia

#### Metoda Różnicowa (ang. Differential Method)

Zamiast ufać polu `waste_percentage` z LogMeal (które bez zdjęcia referencyjnego zawsze zwraca 100%), implementujemy **obliczenia matematyczne w backendzie**:

```
Zjedzona Masa = weight_grams (z menu) - estimated_weight (z LogMeal)
Procent Zjedzony = (Zjedzona Masa / weight_grams) × 100
Brakujące Makroskładniki = (100% - Procent Zjedzony) × Wartości z Menu
```

**Przykład:**
- Menu: Muffin ważący **221g** z **19g białka** i **341 kcal**
- Zdjęcie po posiłku: LogMeal rozpoznaje ~80g resztek
- Obliczenie:
  - Zjedzona masa: 221 - 80 = **141g** (63.8%)
  - Białko zjedzane: 19 × 0.638 = **12.1g**
  - Białko brakujące: 19 × 0.362 = **6.9g** ← Rekomendacja suplementacji

---

## 🏗️ Architektura Systemu

### Frontend (React + TypeScript + Ionic)

**HomeScreen.tsx** — Integracja waste detection w codziennym menu:

```
1. Pacjent widzi dzisiejsze posiłki z opcjonalnymi wyborami
2. Kliknie przycisk "Zjedzenie":
   - "Zjedzone w całości" (100%) → bez analizy
   - "Zjedzone częściowo" → pojawia się upload zdjęcia
   - "Nie zjedzone" (0%) → bez analizy
3. Upload zdjęcia → wysłanie do backendu
4. Backend zwraca: procent zjedzenia + rekomendacje suplementów
5. Konsola pokazuje szczegółowe wyniki
```

**Wysyłane parametry:**
```javascript
FormData {
  image: File,
  class_constraints: "Marchew,Mąka,Szpinak,Jogurt",  // kluczowe słowa
  weight_grams: 221,              // rzeczywista waga z menu
  reference_weight: 221,          // dla LogMeal
  reference_object: "true",       // detekcja widelca jako skali
  calories_kcal: 341,
  protein_grams: 19,
  fat_grams: 14,
  carbs_grams: 38,
}
```

### Backend (Python + FastAPI)

**Struktura katalogu:**
```
backend/
├── main.py                  # FastAPI app + router integrations
├── config.py               # Settings (unika circular imports)
├── logmeal.py             # Endpoint POST /api/logmeal/analyze
├── meal_analysis.py       # Logika Metody Różnicowej
├── meal_db.py             # MongoDB storage (opcjonalnie)
├── chroma_search.py       # ChromaDB for supplement search
└── .env                   # Zmienne środowiskowe
```

#### `logmeal.py` — Główny Endpoint

```python
POST /api/logmeal/analyze
Content-Type: multipart/form-data

Parametry FormData:
- image: File (JPEG/PNG)
- class_constraints: str  # "Marchew,Mąka,Szpinak"
- weight_grams: float    # 221
- reference_weight: float # 221
- reference_object: str  # "true"
- calories_kcal, protein_grams, fat_grams, carbs_grams: float

Odpowiedź (sukces):
{
  "summary": "Zjadłeś ok. 64% posiłku.",
  "analysis": {
    "consumed_percent": 63.8,
    "missing_nutrients": {
      "kcal": 122.1,
      "protein": 6.9,
      "fat": 5.0,
      "carbohydrates": 13.7
    }
  },
  "recommendation": {
    "title": "Potrzebujesz doładowania!",
    "text": "Brakuje Ci 6.9g białka i 122 kcal. Sugerujemy: OnkoShot.",
    "action_button": "Zamów OnkoShot"
  },
  "_debug": { ... }
}

Odpowiedź (fallback — LogMeal nie rozpoznał):
{
  "error": "unrecognized_image",
  "message": "Zdjęcie jest nieczytelne...",
  "fallback_mode": true,
  "_debug": { ... }
}
```

#### `meal_analysis.py` — Logika Kalkulacji

| Funkcja | Zadanie |
|---------|---------|
| `parse_segmentation_response()` | Parsuje JSON z LogMeal, wyciąga `estimated_weight` dla każdego składnika |
| `calculate_consumed_by_differential_method()` | Oblicza procent zjedzenia i brakujące makroskładniki |
| `should_recommend_supplement()` | Decyduje czy białko > 5g lub kcal > 100 |
| `format_recommendation()` | Formatuje wiadomość dla frontendu |

---

## 🔧 Uruchomienie

### Backend

```bash
cd backend

# 1. Zainstaluj zależności
pip install -r requirements.txt

# 2. Ustaw zmienne środowiskowe (.env)
LOGMEAL_API_KEY=your_key_here
MONGO_URL=mongodb://localhost:27017
CHROMA_HOST=localhost
CHROMA_PORT=8000

# 3. Uruchom serwer
python main.py
# FastAPI uruchomi się na http://localhost:8000
```

### Frontend

```bash
cd frontend

# 1. Zainstaluj zależności
npm install

# 2. Uruchom dev server
npm run dev
# React uruchomi się na http://localhost:5173
```

---

## 📋 Przepływ Użytkownika

### Scenariusz: Pacjent Upload Zdjęcia Resztek

```
1. [Frontend] Pacjent klika "Zjedzenie" → wybiera "Częściowo zjedzone"
   ↓
2. [Frontend] Pojawia się pole do uploadu zdjęcia
   ↓
3. [Pacjent] Robić zdjęcie talerza z widelcem na tło
   ↓
4. [Frontend] Wysyła FormData do POST /api/logmeal/analyze
   - class_constraints: ["Marchew", "Mąka", ...]  ← kluczowe słowa
   - weight_grams: 221  ← rzeczywista waga z menu
   - reference_weight: 221  ← LogMeal wie, że to ma ważyć tyle
   - reference_object: true  ← widelec jako skala
   ↓
5. [Backend - logmeal.py]
   a. Odbiera multipart/form-data
   b. Wysyła do LogMeal /image/segmentation/complete
   c. Otrzymuje: { segmentation_results: [...] }
   ↓
6. [Backend - meal_analysis.py]
   a. parse_segmentation_response() → ekstraktuje estimated_weight
   b. calculate_consumed_by_differential_method():
      - Masa resztek = suma estimated_weight
      - Zjedzona masa = 221 - masa_resztek
      - Procent = (zjedzona_masa / 221) × 100
      - Brakujące makroskładniki = (100% - procent) × wartości
   ↓
7. [Backend]
   a. should_recommend_supplement() → czy białko > 5g?
   b. format_recommendation() → przygotuj tekst dla frontendu
   c. save_meal_report() → zapisz do MongoDB (opcjonalnie)
   ↓
8. [Frontend - Console]
   Wypisuje:
   ✅ Odpowiedź z backendu: {consumed_percent: 63.8, ...}
   📊 Analiza zjedzenia: {...}
   💊 Rekomendacja: OnkoShot
```

### Scenariusz: Fallback — LogMeal Nie Rozpoznał

```
1. Pacjent uploads zdjęcie, ale:
   - Zdjęcie rozmazane
   - Brak widocznych resztek na talerzu
   - AI "poddaje się" i zwraca 100% waste
   ↓
2. [Backend] Detektuje: consumed_percent ≤ 5%
   ↓
3. [Backend] Zwraca fallback response:
   {
     "error": "unrecognized_image",
     "message": "Zdjęcie jest nieczytelne, określ ręcznie...",
     "fallback_mode": true
   }
   ↓
4. [Frontend] Loguje do konsoli (bez alertu)
   ⚠️ FALLBACK MODE: Zdjęcie jest nieczytelne...
   
   → Pacjent wie, że system nie potrafił analizować
   → W przyszłości: UI do ręcznego wpisania procent
```

---

## 🔑 Kluczowe Decyzje Projektowe

### 1. Metoda Różnicowa zamiast LogMeal waste_percentage

**Problem:** LogMeal bez zdjęcia referencyjnego (before/after) zawsze zwraca `waste_percentage: 100%` (zakłada, że nic się nie zmieniło).

**Rozwiązanie:** Użyj `estimated_weight` z LogMeal + rzeczywistej wagi z menu jako punktu odniesienia.

```
Zamiast: waste% = LogMeal.waste_percentage (zawsze ~100% bez referencji)
Robimy: consumed% = (menu_weight - logmeal_estimated_weight) / menu_weight × 100
```

### 2. class_constraints zamiast dish_name

**Problem:** Wysłanie pełnej nazwy "Szpinakowe muffinki z fetą..." myli AI.

**Rozwiązanie:** Wyślij uproszczone słowa kluczowe:
```
class_constraints: "Marchew,Mąka,Szpinak,Jogurt,Feta"
```
LogMeal lepiej rozpoznaje konkretne składniki niż pełny opis.

### 3. reference_object + reference_weight

**Problem:** Bez punktu odniesienia (skali), LogMeal źle estymuje wagę.

**Rozwiązanie:** 
- `reference_object: "fork"` — użyj widelca na talerzu jako skali
- `reference_weight: 221` — powiedz AI, że to ma ważyć 221g

### 4. Circular Import Resolution

**Problem:** `main.py` importuje `logmeal_router` → `logmeal.py` importuje `Settings` → `main.py` ma `Settings` → circular!

**Rozwiązanie:** Wyodrębnij `Settings` do `config.py`, oba importują z niego:
```
main.py → config.py ← logmeal.py
```

### 5. Fallback Mode dla Słabych Zdjęć

**Problem:** Źle zrobione zdjęcia mogą zwrócić błędne wyniki.

**Rozwiązanie:** Jeśli `consumed_percent ≤ 5%`, zwróć fallback z opisem, nie ufaj wyniku.

---

## ⚙️ Zmienne Środowiskowe (.env)

```bash
# LogMeal API
LOGMEAL_API_KEY=your_api_key_here
LOGMEAL_API_URL=https://api.logmeal.es/v2

# MongoDB (opcjonalnie)
MONGO_URL=mongodb://localhost:27017
MONGO_DB=pacjentwybiera

# ChromaDB (opcjonalnie)
CHROMA_HOST=localhost
CHROMA_PORT=8000

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 🧪 Testowanie

### Test 1: Upload Zdjęcia ze Szczególami

1. Otwórz frontend: `http://localhost:5173`
2. Przejdź do HomeScreen (główna strona)
3. Klikni "Zjedzenie" na pierwszym posiłku → "Częściowo zjedzone"
4. Upload zdjęcie talerza z resztkami i widelcem
5. Sprawdzenie konsoli przeglądarki:
   ```
   ✅ Odpowiedź z backendu: {...}
   📊 Analiza zjedzenia: {
     consumed_percent: 63.8,
     missing_nutrients: {...}
   }
   ```

### Test 2: Fallback Mode

1. Upload rozmyte/niejasne zdjęcie
2. Konsola wyświetli:
   ```
   ⚠️ FALLBACK MODE: Zdjęcie jest nieczytelne...
   ```

---

## 📚 API Documentation

### POST /api/logmeal/analyze

**Request:**
```http
POST http://localhost:8000/api/logmeal/analyze
Content-Type: multipart/form-data

image=<file>
class_constraints=Marchew,Mąka,Szpinak
weight_grams=221
reference_weight=221
reference_object=true
calories_kcal=341
protein_grams=19
fat_grams=14
carbs_grams=38
```

**Response (200 OK):**
```json
{
  "summary": "Zjadłeś ok. 64% posiłku.",
  "analysis": {
    "consumed_percent": 63.8,
    "missing_nutrients": {
      "kcal": 122.1,
      "protein": 6.9,
      "fat": 5.0,
      "carbohydrates": 13.7
    }
  },
  "recommendation": {
    "title": "Potrzebujesz doładowania!",
    "text": "Brakuje Ci 6.9g białka i 122 kcal. Sugerujemy: OnkoShot.",
    "action_button": "Zamów OnkoShot",
    "missing_nutrients": {...}
  },
  "_debug": {
    "logmeal_raw": {...},
    "segmentation_items": [
      {"food": "muffin", "estimated_weight": 80}
    ]
  }
}
```

**Response (Fallback — 400/422):**
```json
{
  "error": "unrecognized_image",
  "message": "Zdjęcie jest nieczytelne, określ ręcznie ile zjadłeś.",
  "fallback_mode": true,
  "original_meal_weight": 221,
  "calories": 341
}
```

---

## 🚀 Przyszłe Usprawnienia

- [ ] UI do ręcznego wpisania procent (fallback mode)
- [ ] Integracja z JWT/session do extraktu user_id
- [ ] Display wyników w UI (zamiast tylko konsoli)
- [ ] Storing reports w MongoDB
- [ ] ChromaDB integration dla supplement search
- [ ] Mobile app responsiveness
- [ ] Batch analysis (wiele zdjęć naraz)

---

## 📝 Autor

Implementacja: Issue #4 — Waste Detection System
Status: ✅ Complete (core flow)
Ostatnia aktualizacja: 2026-05-11