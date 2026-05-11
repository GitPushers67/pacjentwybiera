# 99 · Źródła i bibliografia

## Dokumenty źródłowe (w folderze `wiedza/`)

### 1. `2019_ulotka-o-ywieniu.pdf`
- **Tytuł:** „Dieta w chorobie onkologicznej"
- **Autorka:** mgr Monika Jędruszczak-Kępka, dietetyk szpitalny
- **Instytucja:** Centrum Onkologii Ziemi Lubelskiej
- **Rok:** 2019, Lublin
- **Charakter:** ulotka informacyjna z wykładów dla pacjentów onkologicznych
- **Zawartość:** zasady diety pełnowartościowej, lekkostrawnej, wysokobiałkowej, listy produktów wskazanych/niewskazanych, napoje, jadłospis 7-dniowy

### 2. `DIETA-PRZY-CHEMIOTERAPII.pdf`
- **Tytuł:** „Zalecenia diety podczas chemioterapii"
- **Wydawca:** Poradnia Żywieniowa, Narodowy Instytut Onkologii — Oddział w Krakowie
- **Charakter:** zalecenia kliniczne dla pacjentów w trakcie chemioterapii
- **Zawartość:** indywidualizacja diety, postępowanie przy konkretnych objawach (nudności, brak apetytu, zapalenie jamy ustnej, biegunka — dieta BRAT, zaparcia), zapotrzebowanie na białko (1,2–2 g/kg m.c./dobę), bezpieczne suplementy (D3, omega-3), 5 najczęstszych mitów żywieniowych

### 3. `Zywienie_podczas_radioterapii_i_chemioterapii.pdf`
- **Tytuł:** „Żywienie podczas radioterapii i chemioterapii"
- **Autorka:** mgr inż. Monika Jędruszczak-Kępka, dietetyk
- **Charakter:** prezentacja wykładowa
- **Email kontaktowy autorki:** mkepka@cozl.eu
- **Zawartość:** szczegółowe omówienie skutków ubocznych chemio/radioterapii i postępowania dietetycznego, dieta BRAT, dieta bogatoresztkowa, produkty zalecane i przeciwwskazane, napoje, 5 wzorcowych jadłospisów (płynny, papkowaty, standardowy, przy biegunce, wysokobłonnikowy)

#### Bibliografia z prezentacji
- Aleksandra Kapała — *Dieta w chorobie nowotworowej*
- Helena Ciborowska, Anna Rudnicka — *Dietetyka*
- Mirosław Jarosz (red.) — *Praktyczny Podręcznik Dietetyki* (IŻŻ)
- Zofia Wieczorek-Chełmińska — *Żywienie w chorobach nowotworowych*
- Daniella Chace — *Dieta w chorobach nowotworowych*
- Wiera Chmielewska — *Wygraj z rakiem*
- Maria Brzegowy — *Nie daj się rakowi*

## Źródła internetowe

### 4. Pacjent Wybiera — opis diety onkologicznej
- **URL:** https://pacjentwybiera.pl/dieta/dieta-onkologiczna/
- **Charakter:** strona produktowa cateringu dietetycznego
- **Zawartość użyteczna:**
  - 3 warianty diety: w trakcie leczenia, w trakcie radio/chemio, w remisji,
  - założenia diety: wysoka wartość odżywcza i kaloryczna, łatwa w spożyciu, wysokobiałkowa, dostosowana do objawów,
  - sekcje opisowe (dieta nowotworowa, dieta w trakcie leczenia, dieta a zmieniona tolerancja smakowa, posiłki łatwe do przełknięcia, nawodnienie i równowaga energetyczna),
  - FAQ (czy dla każdego pacjenta, dla osób z osłabionym apetytem, miksowanie posiłków).

## Standardy zewnętrzne (rekomendowane do dalszej walidacji)

> Te standardy nie są pełnotekstowo w bazie wiedzy, ale **zaleca się** ich uzupełnienie przy walidacji klinicznej:

- **ESPEN guidelines on nutrition in cancer patients** (European Society for Clinical Nutrition and Metabolism)
- **PTŻK** — Polskie Towarzystwo Żywienia Klinicznego, wytyczne
- **PTOK** — Polskie Towarzystwo Onkologii Klinicznej, zalecenia żywieniowe
- **NCCN Clinical Practice Guidelines in Oncology — Palliative Care / Cachexia**
- **WHO IARC** — Międzynarodowa Agencja Badań nad Rakiem (czynniki ryzyka)

## Status walidacji bazy wiedzy

| Sekcja | Źródło dominujące | Status |
|--------|-------------------|--------|
| `01-zasady-ogolne.md` | Lublin 2019, Jędruszczak-Kępka prezentacja, NIO Kraków | ✅ Spójne między źródłami |
| `02-objawy-i-postepowanie.md` | NIO Kraków, prezentacja Jędruszczak-Kępka | ✅ Wysoka zgodność |
| `03-produkty-zalecane-i-przeciwwskazane.md` | Lublin 2019, prezentacja, NIO Kraków | ✅ Wysoka zgodność |
| `04-konsystencje-i-warianty-diety.md` | „Pacjent Wybiera", prezentacja | ⚠️ Warianty „Pacjent Wybiera" — marketingowe; zalecana walidacja z ESPEN |
| `05-napoje-i-nawodnienie.md` | prezentacja Jędruszczak-Kępka, Lublin 2019 | ✅ Spójne |
| `06-mity-zywieniowe.md` | NIO Kraków | ✅ Bezpośrednio z dokumentu |
| `07-jadlospisy-przykladowe.md` | prezentacja, Lublin 2019 | ✅ Cytowane bezpośrednio |
| `08-model-predykcji-cechy.md` | synteza autora bazy + dokumenty źródłowe | ⏳ Wymaga walidacji przez dietetyka klinicznego i ML engineera |

## Konflikty / niejasności do rozstrzygnięcia

| Punkt | Konflikt | Sugerowane rozstrzygnięcie |
|-------|----------|----------------------------|
| Sok pomarańczowy w ulotce Lublin 2019 (Dzień 4 obiadu) vs. zakaz cytrusów w trakcie chemioterapii | Konflikt | W aplikacji **trzymać się zakazu cytrusów w trakcie chemio**; jadłospis był ogólnym przykładem. |
| Surowe warzywa i owoce w jadłospisach standardowych vs. zakaz przy biegunce | Konflikt warunkowy | Forma podania zależy od objawów aktualnych — model rozstrzyga dynamicznie. |
| „Brokuł, kalafior" raz wskazane (zaparcia), raz wzdymające | Konflikt warunkowy | Priorytet ma `wzdecia` (jeśli obecne) > `zaparcia`. |
| Cynamon, imbir, goździki — zalecane przy nudnościach, zakazane przy zapaleniu jamy ustnej | Konflikt warunkowy | Zależne od objawu — model rozstrzyga. |
| Mleko — przeciwwskazane czy nie? | Mit (NIO Kraków) | Mleko OK przy braku nietolerancji laktozy. Patrz `06-mity-zywieniowe.md`. |

## Zmiany / wersjonowanie bazy wiedzy

| Wersja | Data | Co | Autor |
|--------|------|-----|-------|
| v0.1 | 2025-05-11 | Pierwsza struktura bazy wiedzy: 8 plików merytorycznych + README + źródła. Ekstrakcja 3 PDF + analiza pacjentwybiera.pl/dieta/dieta-onkologiczna. | Cascade (AI assistant) |
| **TODO** | — | Walidacja przez dietetyka klinicznego | — |
| **TODO** | — | Synchronizacja kluczy z `frontend/src/types.ts` i `data.ts` | — |
| **TODO** | — | Uzupełnienie wytycznymi ESPEN / PTŻK | — |
