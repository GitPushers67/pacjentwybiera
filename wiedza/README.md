# Baza wiedzy: żywienie pacjentów onkologicznych

Baza wiedzy dla projektu **PacjentWybiera** — aplikacji wspierającej pacjentów onkologicznych w wyborze posiłków zgodnie z etapem leczenia i aktualnym samopoczuciem. Plik ten jest indeksem; szczegóły znajdują się w plikach numerowanych.

## Cel bazy wiedzy

1. **Wsparcie merytoryczne dla zespołu** — jednolite źródło zasad żywienia w onkologii (chemioterapia, radioterapia, rekonwalescencja).
2. **Fundament pod model AI** — zebrane reguły, tabele produktów i mapowania objaw → postępowanie, które można przełożyć na:
   - **klasyfikator rekomendacji** (jakie posiłki/produkty wybrać dla pacjenta o danym profilu i objawach),
   - **regresor samopoczucia** (predykcja, czy dany posiłek poprawi/pogorszy stan pacjenta),
   - **system reguł** (hard constraints — produkty bezwzględnie zakazane przy chemioterapii np. grejpfrut).

## Struktura

| Plik                                          | Zawartość                                                                                                                               | Znaczenie dla modelu                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `01-zasady-ogolne.md`                         | Fundamentalne zasady żywienia w chorobie nowotworowej                                                                                   | Tło — definiuje funkcję celu (zapobieganie niedożywieniu, wzmocnienie odporności).                  |
| `02-objawy-i-postepowanie.md`                 | Mapowanie _objaw → dieta_                                                                                                               | **RDZEŃ** — bezpośrednio przekładalne na reguły / etykiety treningowe.                              |
| `03-produkty-zalecane-i-przeciwwskazane.md`   | Tabele produktów z kategoriami                                                                                                          | Słownik kategoryczny dla feature engineeringu posiłków.                                             |
| `04-konsystencje-i-warianty-diety.md`         | Konsystencje (płynna, papkowata…) i 3 warianty diety onkologicznej                                                                      | Definiuje jeden z głównych wymiarów rekomendacji.                                                   |
| `05-napoje-i-nawodnienie.md`                  | Płyny zalecane i przeciwwskazane                                                                                                        | Osobny moduł rekomendacji (≥2,5 l/dobę).                                                            |
| `06-mity-zywieniowe.md`                       | Obalone mity (cukier, mięso, sok z buraka, amigdalina…)                                                                                 | Reguły do filtrowania błędnych zaleceń / treści edukacyjnych w aplikacji.                           |
| `07-jadlospisy-przykladowe.md`                | Przykładowe jadłospisy w 5 wariantach                                                                                                   | Dane „złotego standardu" do walidacji rekomendacji.                                                 |
| `08-model-predykcji-cechy.md`                 | Propozycja cech (features), etykiet (labels) i architektury modelu                                                                      | **Bezpośredni input do ML/AI** (teoria).                                                            |
| `09-architektura-w-twojej-infrastrukturze.md` | Mapowanie modelu na **realny stack** (React+Ionic, FastAPI, MongoDB, ChromaDB) + roadmap fazowy + minimal viable ranker w 80 liniach TS | **Plan implementacji** zsynchronizowany z `frontend/src/`, `backend/main.py`, `docker-compose.yml`. |
| `99-zrodla.md`                                | Źródła i bibliografia                                                                                                                   | Audyt pochodzenia wiedzy.                                                                           |

## Najważniejsze tezy w jednym akapicie

> Dieta pacjenta onkologicznego musi być **pełnowartościowa, lekkostrawna, wysokobiałkowa, wysokoenergetyczna i dobrze zbilansowana**, podawana w **6–8 małych posiłkach** dziennie zamiast 3–5. Najczęstszym ryzykiem jest **niedożywienie**, a kluczową zmienną — **aktualne objawy uboczne leczenia** (nudności, biegunka, zaparcia, zapalenie jamy ustnej, zmiany smaku, jadłowstręt). To one decydują o doborze konsystencji, smaku i składu posiłków znacznie bardziej niż sam typ nowotworu. Bezwzględnie zakazany podczas chemioterapii jest **grejpfrut** (interakcja z lekami) oraz wszelkie samodzielnie stosowane zioła i suplementy poza witaminą D3 i kwasami omega-3.

## Konwencje w plikach

- **Polski język** — pacjenci, dietetycy, dokumenty źródłowe są PL.
- **Tabele markdown** wszędzie, gdzie wiedza ma być parsowalna programowo (objaw → produkt, produkt → kategoria).
- **Identyfikatory objawów i produktów w `snake_case`** (np. `nudnosci`, `zapalenie_jamy_ustnej`, `mieso_chude`) — stabilne klucze do użycia w kodzie i w `data.ts`.
- **Cytaty z dokumentów źródłowych** w blokach `>` z odnośnikiem do pliku w `99-zrodla.md`.
- **Bezwzględne zakazy** oznaczone `🚫 BEZWZGLĘDNIE` (do wykorzystania jako hard constraints w modelu).
- **Silne zalecenia** oznaczone `⭐ ZALECANE`.

## Powiązanie z kodem aplikacji

W `frontend/src/data.ts` istnieją struktury:

- `meals[]` — posiłki z opcjami,
- `symptomTips{}` — porady wg objawu.

Klucze objawów z `02-objawy-i-postepowanie.md` powinny być zsynchronizowane z kluczami w `symptomTips`, a kategorie produktów z `03-produkty-zalecane-i-przeciwwskazane.md` powinny być przyporządkowane do każdej opcji posiłku jako tagi.

## Status

| Sekcja                                             | Status                             |
| -------------------------------------------------- | ---------------------------------- |
| Ekstrakcja z PDF (3 dokumenty)                     | ✅                                 |
| Analiza pacjentwybiera.pl/dieta/dieta-onkologiczna | ✅                                 |
| Strukturyzacja w MD                                | ✅ (v1)                            |
| Walidacja przez dietetyka klinicznego              | ⏳ TODO przed użyciem produkcyjnym |
| Mapowanie na schemat danych aplikacji              | ⏳ TODO                            |

> **Uwaga prawna:** baza wiedzy ma charakter informacyjny i opiera się na materiałach dietetyków klinicznych (Centrum Onkologii Ziemi Lubelskiej, Narodowy Instytut Onkologii Oddział w Krakowie, „Pacjent Wybiera"). Każda decyzja kliniczna należy do lekarza prowadzącego i dietetyka. Aplikacja musi prezentować to ostrzeżenie użytkownikowi.
