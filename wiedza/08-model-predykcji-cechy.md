# 08 · Model predykcji — cechy, etykiety, architektura

> Plik łączy całą wiedzę z plików `01`–`07` w **konkretną propozycję feature engineeringu** dla dwóch zadań ML:
>
> 1. **Rekomendacja posiłku** (klasyfikacja / ranking): „jaki posiłek z menu najlepiej zaproponować pacjentowi X w kontekście Y?".
> 2. **Predykcja samopoczucia** (regresja / klasyfikacja): „jak pacjent będzie się czuł po zjedzeniu posiłku M w stanie S?".

## 1. Trzy warstwy systemu

```
┌─────────────────────────────────────────────────────┐
│ 1. WARSTWA REGUŁ (hard constraints)                 │  ← deterministyczna
│    - lista BEZWZGLĘDNYCH zakazów (grejpfrut, …)     │
│    - twarde sprzeczności (laktoza × nietolerancja)  │
└─────────────────────────────────────────────────────┘
           ↓ filtruje przestrzeń dopuszczalnych posiłków
┌─────────────────────────────────────────────────────┐
│ 2. WARSTWA REKOMENDACJI (ML)                        │  ← uczy się z preferencji
│    - LightGBM / XGBoost ranker / collaborative      │
│    - input: profil + objawy + historia              │
│    - output: top-K posiłków                         │
└─────────────────────────────────────────────────────┘
           ↓ rekomendacja
┌─────────────────────────────────────────────────────┐
│ 3. WARSTWA PREDYKCJI SAMOPOCZUCIA                   │  ← uczy się z feedbacku
│    - regresja/klasyfikacja: posiłek → ∆samopoczucie │
│    - sygnał: subiektywna ocena 1–5 + objawy po 2-4h │
└─────────────────────────────────────────────────────┘
```

**Dlaczego trójwarstwowo:**
- Warstwa 1 jest **bezwzględna** — bezpieczeństwo pacjenta nie może zależeć od decyzji ML (przykład: model nigdy nie powinien zaproponować grejpfruta przy chemioterapii).
- Warstwa 2 **personalizuje** — ML uczy się preferencji konkretnego pacjenta i populacji.
- Warstwa 3 **zamyka pętlę** — feedback po posiłku karmi model 2 i 3.

## 2. Cechy pacjenta (Patient Features)

### 2.1 Profil statyczny (zmienny rzadko)

| Cecha | Typ | Zakres / Enum | Źródło |
|-------|-----|----------------|--------|
| `wiek` | int | 0–120 | profil |
| `plec` | enum | `M`, `K`, `inna` | profil |
| `wzrost_cm` | float | 100–220 | profil |
| `bmi` | float | wyliczane | wzrost + waga |
| `typ_nowotworu` | enum | `pierś`, `jelito`, `pluco`, `prostata`, `głowa_szyi`, `krew_chłonny`, `inny` | wywiad medyczny |
| `lokalizacja_anatomiczna` | enum | `gora_pp`, `dol_pp`, `gruczol_piersiowy`, `inne` | j.w. |
| `stopien_zaawansowania` | enum | `I`, `II`, `III`, `IV` | j.w. |
| `choroby_wspolistniejace` | multi-hot | `cukrzyca`, `nadcisnienie`, `niewydolnosc_nerek`, `choroba_watroby`, `celiakia`, `chuk`, `brak` | profil |
| `alergie_pokarmowe` | multi-hot | gluten, laktoza, jaja, orzechy, ryby, … | profil |
| `wykluczenia_swiatopogladowe` | multi-hot | wegetarianizm, weganizm, koszer, halal | profil |
| `preferencje_smakowe_bazowe` | multi-hot | słodki, słony, kwaśny, gorzki, umami | wywiad |

### 2.2 Stan kliniczny (zmienia się tygodniowo / w cyklu)

| Cecha | Typ | Zakres / Enum |
|-------|-----|----------------|
| `aktualne_terapie` | multi-hot | `chemioterapia`, `radioterapia`, `immunoterapia`, `hormonoterapia`, `chirurgia_niedawna`, `paliatywna` |
| `dzien_cyklu_chemio` | int | 1–N (dzień od ostatniego wlewu) |
| `protokol_chemio` | string | nazwa schematu (FOLFOX, AC-T, …) — opcjonalne |
| `nietolerancja_laktozy_aktualna` | bool | TRUE/FALSE |
| `waga_kg` | float | aktualna |
| `delta_wagi_30d_pct` | float | spadek/wzrost % w ciągu 30 dni |
| `bialko_zalecane_g_dziennie` | float | 1.2 × waga … 2.0 × waga |
| `flag_niedozywienie` | bool | jeśli BMI<18.5 lub spadek wagi ≥5%/mies. |

### 2.3 Stan dynamiczny (zmienia się dziennie / kilka razy dziennie)

| Cecha | Typ | Zakres |
|-------|-----|--------|
| `objawy_aktualne` | multi-hot | wszystkie klucze z `02-objawy-i-postepowanie.md` |
| `objawy_severity` | dict<klucz, 0..3> | 0=brak, 1=łagodne, 2=umiarkowane, 3=ciężkie |
| `samopoczucie_baseline_1_5` | int | subiektywna ocena dnia |
| `apetyt_1_5` | int | subiektywna ocena apetytu |
| `pora_dnia` | enum | `rano`, `przed_poludniem`, `poludnie`, `popoludnie`, `wieczor`, `noc` |
| `czas_od_ostatniego_posilku_h` | float | |
| `czas_od_wlewu_h` | float | (jeśli dotyczy) |

## 3. Cechy posiłku (Meal Features)

Patrz `03-produkty-zalecane-i-przeciwwskazane.md` (sekcja 12 — schemat `MealTags`).

### Skrót — kluczowe cechy posiłku

| Cecha | Typ | Wartości |
|-------|-----|----------|
| `meal_id` | string | unikalny |
| `slot` | enum | `sniadanie`, `ii_sniadanie`, `obiad`, `podwieczorek`, `kolacja` |
| `consistency` | enum | `standardowa`, `papkowata`, `plynna`, `krem`, `puree` |
| `temperature_recommended` | enum | `zimna`, `pokojowa`, `cieplo` |
| `taste_profile` | multi-hot | neutralny, słodki, słony, kwaśny, gorzki, umami |
| `aromatic_intensity` | int | 1–3 |
| `kcal` | int | |
| `protein_g` | int | |
| `fat_g` | int | |
| `carb_g` | int | |
| `fiber_g` | int | |
| `lactose_mg` | int | 0–N |
| `gluten` | bool | |
| `contains_products` | multi-hot | klucze z tabeli produktów |
| `contraindicated_for_symptoms` | multi-hot | klucze z `02-objawy-i-postepowanie.md` |
| `recommended_for_symptoms` | multi-hot | j.w. |
| `diet_protocol_compatible` | multi-hot | `BRAT`, `bogatoresztkowa`, `lekkostrawna`, `wysokobialkowa`, `bezlaktozowa` |

## 4. Etykiety / Targety modelu

### 4.1 Model rekomendacji (Warstwa 2)

Trzy warianty zadania, do wyboru w zależności od dostępnych danych:

**Wariant A — klasyfikacja binarna „akceptowalny / nieakceptowalny":**
- `target = 1` jeśli pacjent zjadł ≥80% posiłku **i** ocenił samopoczucie po na ≥3/5,
- `target = 0` w przeciwnym razie.

**Wariant B — regresja oceny (1–5):**
- `target = ocena_pacjenta_1_5` (po posiłku).

**Wariant C — Learning to Rank (LambdaMART):**
- dla danego `(pacjent, kontekst)` ranker preferencji w zbiorze posiłków podanych tego dnia.

### 4.2 Model predykcji samopoczucia (Warstwa 3)

`y = samopoczucie_po_posilku_1_5 - samopoczucie_przed_posilkiem_1_5`

lub klasyfikacja:
- `pogorszenie` (Δ ≤ -1),
- `bez_zmian` (Δ = 0),
- `poprawa` (Δ ≥ 1).

Dodatkowy target wielowymiarowy:
- `objawy_pogorszone_po_posilku` — multi-label (które objawy się pogorszyły, np. nudności po tłustym posiłku).

## 5. Pipeline danych

```
[Pacjent] → wybór posiłku w aplikacji
              ↓
         [Logowanie zdarzenia]
              ↓
[2-4h po posiłku] → ankieta: ocena 1-5, objawy obecne, ile zjadł
              ↓
         [Tabela faktów (mealsxepisode)]
              ↓
        [Train/Eval split z anonimizacją]
              ↓
   [Trening modelu offline] ← cyklicznie (np. tygodniowo)
              ↓
        [Aktualizacja wag w API]
```

### Schemat tabeli `meal_episode` (jeden wiersz = jedno zjedzenie)

| Pole | Typ |
|------|-----|
| `episode_id` | uuid |
| `patient_id_hash` | string (anonimizowany) |
| `meal_id` | string |
| `timestamp_offered` | datetime |
| `timestamp_consumed` | datetime |
| `consumed_pct` | int (0–100) |
| `score_before_1_5` | int |
| `score_after_1_5` | int |
| `symptoms_before` | json |
| `symptoms_after_2h` | json |
| `notes` | text |
| `patient_features_snapshot` | json (zatrzaśnięty stan) |
| `meal_features_snapshot` | json |

## 6. Architektura — propozycje konkretne

### 6.1 Wersja 0 (MVP, bez ML)
**System reguł** wprost z plików `02`/`03`/`04`.
- Stos: TypeScript w backendzie / `frontend/src/data.ts`.
- Algorytm: filtrujemy posiłki, które:
  1. nie zawierają produktów z `HARD_CONSTRAINTS`,
  2. mają `contraindicated_for_symptoms ∩ objawy_aktualne == ∅`,
  3. mają `diet_protocol_compatible` zgodny z aktualnym protokołem.
- Sortujemy po:
  - liczbie objawów obsłużonych (`recommended_for_symptoms`),
  - kompatybilności z preferencjami,
  - kalorycznością/białkiem (jeśli `flag_niedozywienie`).
- **Zalety:** w 100% przewidywalne, tłumaczalne dla dietetyka, działa bez danych.
- **Wady:** brak personalizacji.

### 6.2 Wersja 1 (LightGBM ranker)
- Po zebraniu ~1000 epizodów posiłkowych z feedbackiem.
- Cechy: konkatenacja patient + meal + interakcje (np. `meal_kcal × flag_niedozywienie`, `meal_lactose × nietolerancja_laktozy`).
- Library: `lightgbm` (LGBMRanker) lub `xgboost`.
- Cross-validation per pacjent (group-aware, żeby nie mieć leaku).

### 6.3 Wersja 2 (Hybrid + Neural)
- **Two-tower model**: enkoder pacjenta + enkoder posiłku → dot product → score.
- Embedding produktów (np. word2vec na sekwencjach posiłków).
- LSTM/Transformer na **sekwencji ostatnich 7 dni objawów + posiłków** — szczególnie dla predykcji samopoczucia.
- Library: `pytorch` + `pytorch-lightning`.

### 6.4 Predykcja samopoczucia
- Model regresyjny gradient boosting (LightGBM Regressor) dla `Δsamopoczucie`.
- Cechy interakcji najważniejsze:
  - `meal_fat_level × ma_objaw[nudnosci_wymioty]`,
  - `meal_fiber_level × ma_objaw[biegunka]`,
  - `meal_lactose × nietolerancja_laktozy`,
  - `meal_temperature × ma_objaw[zapalenie_jamy_ustnej]`,
  - `meal_aromatic_intensity × ma_objaw[nudnosci_wymioty]`.

## 7. Kluczowe **interakcje cech** (feature crosses) wynikające z wiedzy

To bezpośredni przekład wiedzy z plików `02`–`05` na cechy interakcyjne.

| Interakcja | Oczekiwany wpływ |
|-----------|------------------|
| `nudnosci × meal_temperature_gorace` | ↓ samopoczucie |
| `nudnosci × meal_aromatic_intensity_wysoka` | ↓ samopoczucie |
| `nudnosci × meal_fat_high` | ↓ samopoczucie |
| `zapalenie_jamy_ustnej × meal_taste_kwasny` | ↓ samopoczucie |
| `zapalenie_jamy_ustnej × meal_taste_ostry` | ↓ samopoczucie |
| `zapalenie_jamy_ustnej × meal_consistency_papkowata` | ↑ samopoczucie |
| `biegunka × meal_fiber_high` | ↓ samopoczucie |
| `biegunka × meal_protocol_BRAT` | ↑ samopoczucie |
| `biegunka × meal_lactose>0` | ↓ samopoczucie |
| `zaparcia × meal_fiber_high` | ↑ samopoczucie |
| `zaparcia × meal_consistency_plynna` | ↓ samopoczucie |
| `wzdecia × contains[brokul/kalafior/kapusta/groch/cebula]` | ↓ samopoczucie |
| `nietolerancja_laktozy × meal_lactose>0` | ↓ samopoczucie |
| `niechec_do_miesa × meal_protein_source==mieso` | ↓ samopoczucie |
| `niechec_do_miesa × meal_protein_source==jajka` | ~neutralne / ↑ |
| `flag_niedozywienie × meal_kcal_high` | ↑ wartość kliniczna |
| `flag_niedozywienie × meal_protein_high` | ↑ wartość kliniczna |
| `chemioterapia_aktywna × contains[grejpfrut/pomelo/granat]` | **HARD BLOCK** |
| `pora_dnia=noc × meal_kcal_low` | OK (oczekiwane) |
| `posmak_metaliczny × cutlery=metal` | ↓ samopoczucie |

## 8. Metryki ewaluacji

| Zadanie | Metryka | Próg minimalny |
|---------|---------|----------------|
| Klasyfikacja binarna (akceptowalny / nie) | AUC, F1 | AUC > 0.75 |
| Ranking | NDCG@5 | > 0.80 vs random > 0.5 |
| Regresja samopoczucia | RMSE, MAE | MAE < 0.7 (na skali 1–5) |
| Predykcja Δobjawów | Per-symptom F1 | > 0.6 dla najczęstszych |
| Twarde reguły (Warstwa 1) | Precision = 1.0 | nigdy nie polecamy zakazanego |

**Ewaluacja dziedzinowa** — KAŻDA wersja modelu **przed wdrożeniem produkcyjnym** musi zostać oceniona przez **dietetyka klinicznego** na zestawie 50–100 syntetycznych przypadków.

## 9. Dane treningowe — strategie pozyskiwania

1. **Bootstrapowanie z reguł.** Pierwsze etykiety = wynik systemu reguł (wersja 0). Model uczy się reguł, potem dostraja na realnym feedbacku.
2. **Symulacje pacjentów** generowanych na podstawie tabel objaw → reakcja z `02`. Przydatne do testów.
3. **Realny feedback w aplikacji.** Po każdym posiłku 2–4 h później pytamy pacjenta:
   - Ile zjadłeś (slider 0–100%)?
   - Jak się czujesz teraz (1–5)?
   - Czy pojawiły się/nasiliły objawy? (lista ciekawe).
4. **Anotacja przez dietetyków** dla rzadkich przypadków (cold start).
5. **Wzbogacanie z wytycznych ESPEN/PTŻK** (wzbogacenie wiedzy domenowej).

## 10. Etyka, bezpieczeństwo, prawo

- **Aplikacja nie jest wyrobem medycznym** (póki co) — komunikaty disclaimerowe wymagane.
- **Każda rekomendacja podlega zatwierdzeniu** przez dietetyka klinicznego (w wersji szpitalnej).
- **Dane wrażliwe** (RODO + ustawa o ochronie danych medycznych): konieczna anonimizacja, zgody, zaszyfrowane bazy.
- **Wyjaśnialność** (XAI): SHAP values dla każdej rekomendacji — pacjent / dietetyk widzi „dlaczego ten posiłek".
- **Bias**: walidacja modelu na różnych populacjach (wiek, płeć, typ nowotworu). Nie pozwalać, by model nadmiernie polegał na cechach demograficznych.
- **Hard fallback**: jeśli model jest niepewny (entropia > prog) lub objawy są ciężkie (severity=3) → kierowanie do **kontaktu z dietetykiem.**

## 11. Roadmap

| Faza | Cel | Czas |
|------|-----|------|
| Faza 0 | Implementacja tagów posiłków w `data.ts` zgodnie z `03` i `07` | 1–2 tyg. |
| Faza 1 | Silnik reguł v0 (TypeScript) | 2 tyg. |
| Faza 2 | Logowanie epizodów posiłkowych + ankieta po-posiłkowa | 2 tyg. |
| Faza 3 | Pierwszy LightGBM ranker po zebraniu ~1k epizodów | po 2–3 mies. |
| Faza 4 | Predykcja samopoczucia (regresja) | równolegle z fazą 3 |
| Faza 5 | Personalizacja (embeddingi pacjenta) | po 3–6 mies. |
| Faza 6 | Walidacja kliniczna (badanie obserwacyjne) | 6+ mies. |

## 12. Łącznik do plików w bazie wiedzy

| Cecha modelu | Pochodzenie wiedzy |
|--------------|---------------------|
| Lista objawów + reguły | `02-objawy-i-postepowanie.md` |
| Słownik produktów + tagi | `03-produkty-zalecane-i-przeciwwskazane.md` |
| Reguły konsystencji | `04-konsystencje-i-warianty-diety.md` |
| Reguły płynów | `05-napoje-i-nawodnienie.md` |
| Filtry treści edukacyjnych | `06-mity-zywieniowe.md` |
| Złoty standard / etykiety supervisowane | `07-jadlospisy-przykladowe.md` |
| Cele kliniczne (loss aux) | `01-zasady-ogolne.md` (zapobieganie niedożywieniu, wzmocnienie odporności) |
