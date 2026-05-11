# 02 · Objawy uboczne leczenia → postępowanie dietetyczne

> **To jest rdzeń wiedzy dla modelu predykcyjnego.** Każdy z poniższych objawów to kategoryczna cecha wejściowa, a powiązane zalecenia to gotowe etykiety / reguły rekomendacji.

Klucze objawów (`snake_case`) są stabilne — należy używać ich jako stałych w kodzie aplikacji (np. w `frontend/src/types.ts` jako `type Symptom`).

---

## Lista objawów (słownik kluczy)

| Klucz | Etykieta PL | Częstość | Klastry leczenia |
|-------|-------------|----------|-------------------|
| `nudnosci_wymioty` | Nudności i wymioty | bardzo częsty | chemioterapia, radioterapia |
| `brak_apetytu` | Brak apetytu (jadłowstręt) | bardzo częsty | wszystkie |
| `zmiana_smaku` | Zmiana / utrata smaku, posmak metaliczny | częsty | chemioterapia |
| `zapalenie_jamy_ustnej` | Zapalenie jamy ustnej i przełyku, ból przy przełykaniu | częsty | radioterapia głowy/szyi, chemioterapia |
| `suchosc_jamy_ustnej` | Suchość w ustach, zmniejszony napływ śliny | częsty | radioterapia głowy/szyi |
| `dysfagia` | Trudności z przełykaniem | częsty | nowotwory g. odc. przewodu pokarm., radioterapia szyi |
| `biegunka` | Biegunka | częsty | chemioterapia, radioterapia jamy brzusznej/miednicy |
| `zaparcia` | Zaparcia | częsty | chemioterapia, opioidy |
| `wzdecia` | Wzdęcia, uczucie pełności, gazy | częsty | wszystkie |
| `zmeczenie` | Zmęczenie / osłabienie / brak siły | bardzo częsty | wszystkie |
| `niedozywienie` | Niedożywienie / spadek masy ciała | bardzo częsty | zaawansowana choroba |
| `nietolerancja_laktozy` | Wtórna nietolerancja laktozy | częsty | chemio/radioterapia |
| `niechec_do_miesa` | Niechęć do mięsa / zapachu mięsa, ryb | częsty | chemioterapia |

---

## 1. `nudnosci_wymioty` — Nudności i wymioty

### Zalecenia:

- ✅ **Małe porcje co 2–3 godziny.**
- ✅ **Posiłki o temperaturze pokojowej** (gorące i intensywnie pachnące posiłki stymulują ośrodek węchowy w mózgu i nasilają nudności).
- ✅ Posiłki o **łagodnym zapachu**, dobrze wietrzone pomieszczenie / na świeżym powietrzu.
- ✅ **Pozycja pionowa po posiłku** — zapobiega cofaniu się treści pokarmowej.
- ✅ **Świeży imbir** dodawany do letniej herbaty.
- ✅ **Owocowe musy, galaretki, najlepiej schłodzone.**
- ✅ **Cukierki miętowe**, zamrożone kostki ananasa do ssania.
- ✅ **Suszone produkty ze skrobią** (krakersy, suchary, tosty) — skrobia zapobiega wymiotom.
- ✅ **Zimne napoje, ssanie kostek lodu.**
- ✅ Lekkie pożywienie podzielone na wiele małych posiłków, jedzenie i picie powoli.

### Unikać:
- 🚫 Potraw bardzo słodkich, tłustych, wzdymających, mocno pachnących.
- 🚫 Zagęszczonych zup i sosów.
- 🚫 Zapachu mięsa i ryb (jeśli wzmaga objawy) — patrz `niechec_do_miesa`.

### Reguła dla modelu:
```
IF nudnosci_wymioty:
  meal.temperature ∈ {chłodna, pokojowa}
  meal.aroma_intensity = niska
  meal.fat_content = niska
  meal.sugar_intensity = niska
  meal.size = mała
  recommend_snacks: [krakersy, suchary, tosty, mus_owocowy, galaretka, kostki_ananasa_mrozonego]
```

---

## 2. `brak_apetytu` — Brak apetytu, zmiany smaku

### Zalecenia:
- ✅ **6–8 małych porcji dziennie.**
- ✅ Posiłki na **dużych talerzach** (optycznie zmniejszają porcję).
- ✅ Doprawianie zgodnie z preferencjami pacjenta — **świeże zioła, cytryna, limonka, ocet balsamiczny.**
- ✅ Posiłki **łatwiejsze do spożycia**, częściowo rozdrobnione: koktajle, zupy kremy, musy, pasty, galaretki, kisiele, puree z warzyw i owoców, miękkie pulpety w sosie.
- ✅ **Zimne produkty stymulujące smak**: sorbety owocowe, pokrojony i zamrożony banan, kostki z mrożonego ananasa, arbuza, malin, truskawek.
- ✅ **Dania kwaśne i lekko słone** (zupa ogórkowa, surówka z kiszonej kapusty, słone paluszki, krakersy).
- ✅ **Soczyste, miękkie produkty** — wilgotna konsystencja smakuje lepiej niż sucha/łykowata.
- ✅ Jeśli **metaliczny posmak** w ustach — używać **sztućców innych niż metalowe** (np. plastikowych, drewnianych, ceramicznych).
- ✅ Zwiększać kaloryczność i wartość odżywczą posiłków przez dodatek tłuszczów: **masło, oleje, oliwa, zmielone orzechy, żółtko, awokado, mleko kokosowe.**
- ✅ Świeże zioła: **tymianek, rozmaryn, bazylia, cząber, pietruszka, mięta.**
- ✅ Posiłki ładnie podane, apetyczne; gotować z małą ilością przypraw, doprawiać według upodobań pacjenta.

### Charakterystyka zmian smakowych (dane do modelu):
- Próg smakowy na **smak gorzki** — zazwyczaj **obniżony** (gorycz odczuwana intensywniej).
- Próg smakowy na **smak słodki** — **podwyższony** (potrzebne więcej, by poczuć słodkość).
- Mogą występować po sobie chęci na słodkie, gorzkie, kwaśne — **silna fluktuacja preferencji w czasie.**

### Reguła dla modelu:
```
IF brak_apetytu OR zmiana_smaku:
  meal.energy_density = wysoka  # więcej kcal w mniejszej objętości
  meal.protein_density = wysoka
  meal.consistency ∈ {puree, koktajl, zupa_krem, mus, galaretka}
  meal.taste_profile ∈ {kwaśny, lekko_słony, neutralny}
  meal.aromatic_intensity = niska
  fat_boosters_allowed: [maslo, olej_rzepakowy, oliwa, awokado, orzechy_zmielone, zoltko, mleko_kokosowe]
  enable_cold_options: TRUE  # sorbety, mrożone owoce
  IF posmak_metaliczny: cutlery = niemetalowa
```

---

## 3. `zmiana_smaku` — Zmiana tolerancji smakowej

Patrz wyżej (`brak_apetytu` — zmiany smaku są ściśle z nim powiązane).

Dodatkowo (z materiałów „Pacjent Wybiera"):
- ✅ Posiłki o **spokojnym profilu smakowym** — nieostre, niekwaśne, nieintensywnie aromatyczne.
- ✅ Smak **neutralny** ułatwia jedzenie, gdy każdy aromat drażni lub wywołuje mdłości.
- 🚫 Produkty wcześniej lubiane mogą wywoływać niechęć — należy regularnie testować i aktualizować preferencje.

> **Wniosek dla modelu:** preferencje smakowe pacjenta onkologicznego nie są stałe. Model rekomendacyjny powinien być **adaptacyjny** — uczyć się z reakcji pacjenta po każdym posiłku (feedback loop: posiłek → samopoczucie → aktualizacja modelu preferencji).

---

## 4. `zapalenie_jamy_ustnej` — Zapalenie jamy ustnej i przełyku, ból

### Wybierz:
- ✅ **Łagodne smakowo**: banany, melony, serek homogenizowany naturalny.
- ✅ **Miękka konsystencja**: pulpety, serki, jogurty, musy, budynie, **pieczywo namoczone w mleku.**
- ✅ Posiłki zawiesiste lub w postaci puree.

### Unikaj:
- 🚫 Produktów ostro przyprawionych.
- 🚫 Przypraw rozgrzewających: **imbir, cynamon, kardamon, goździki.**
- 🚫 Dań bardzo gorących lub bardzo zimnych.
- 🚫 Dań bardzo kwaśnych i słonych.
- 🚫 Konsystencji twardej, kruchej, szorstkiej, łykowatej.
- 🚫 Owoców z dużą zawartością kwasów: **porzeczki, grejpfruty, soki owocowe** (kwaśne).

### Reguła dla modelu:
```
IF zapalenie_jamy_ustnej:
  meal.consistency ∈ {puree, krem, papka, mus, miękka}
  meal.temperature = pokojowa  # nie gorąca, nie zimna
  meal.taste_profile = łagodny  # nie ostry, nie kwaśny, nie słony
  blocked_ingredients: [imbir, cynamon, kardamon, gozdziki, ostre_przyprawy, kwasne_owoce, suche_pieczywo, lykowate_mieso]
```

---

## 5. `suchosc_jamy_ustnej` — Suchość w ustach

### Zalecenia:
- ✅ **Częste picie małych ilości płynów.**
- ✅ **Żucie gumy** (bezcukrowej).
- ✅ **Ssanie bezcukrowych cukierków cytrynowych** — pobudzają wydzielanie śliny.
- ✅ Soczyste, miękkie produkty z wysoką zawartością wody.
- ✅ Pieczywo namoczone w mleku, sosy do dań suchych.

### Unikaj:
- 🚫 Suchych produktów bez sosu (suchary solo, krakersy bez napoju).
- 🚫 Napojów gazowanych.

---

## 6. `dysfagia` — Trudności z przełykaniem

### Zalecenia:
- ✅ Konsystencja **miękka, kremowa lub półpłynna** (zupy krem, delikatne puree, lekkie kasze, miękkie dodatki).
- ✅ Posiłki o **wilgotnej konsystencji** — łatwiej przełknąć.
- ✅ Posiłki można **rozdrobnić / zmiksować** do konsystencji papkowatej lub półpłynnej.
- ✅ Powolne jedzenie bez wysiłku.

### Unikaj:
- 🚫 Produktów twardych, łykowatych, kruchych.
- 🚫 Suchych produktów.

> Dieta „Pacjent Wybiera" stosuje miękkie, kremowe lub półpłynne formy posiłku — zupy krem, puree, miękkie kasze.

---

## 7. `biegunka` — Biegunka

### Strategia: **dieta BRAT** (pierwsze 24–48 h)

| Litera | Co | Wartość |
|--------|-----|---------|
| **B** — Bananas | banany **mało dojrzałe, zielonkawe** | bogate w **potas** (ubywa z biegunką/wymiotami) i **pektyny** (zwalczają biegunkę). |
| **R** — Rice | biały ryż, kleik ryżowy, wafle ryżowe, płatki ryżowe | **środek zapierający.** |
| **A** — Apple | **pieczone jabłko, mus z gotowanego jabłka** | rewelacyjne źródło **pektyn** — nasilają wchłanianie sodu i wody. |
| **T** — Toast | tosty pszenne, lekko czerstwe białe pieczywo, drobny dobrze ugotowany makaron, lekko odstałe biszkopty, kasza manna na bulionie/wodzie | źródło **sodu**, omijać ziarna. |

> Dieta BRAT jest **niskokaloryczna, niskobłonnikowa, uboga w proteiny i tłuszcz** — idealna na pierwsze 24–48 godzin. **Nie może być stosowana długofalowo.** Przy objawach trwających > 24 h lub przy zaostrzeniu — konsultacja z lekarzem.

### Inne produkty zapierające (poza BRAT):
- puree z ziemniaków, całe gotowane ziemniaki,
- marchwianka, gotowana marchew,
- chude, gotowane mięso,
- galaretki mięsne (na żelatynie),
- dania mączne (kopytka, pierogi, kluski) **bez tłustych dodatków**,
- jajka na twardo,
- **drobne kasze**: manna, kuskus, jaglana,
- morele (suszone), czarne jagody,
- galaretki, kisiele,
- gorzka czekolada, kakao **na wodzie**.

### Unikaj:
- 🚫 Dań tłustych, smażonych, ostro przyprawionych.
- 🚫 Zawiesistych, tłustych sosów.
- 🚫 **Laktozy** (mleko, lody, słodzone produkty mleczne).
- 🚫 Produktów z pełnego przemiału (ciemne pieczywo, grube kasze).
- 🚫 Surowych warzyw i owoców.
- 🚫 Kawy, alkoholu.
- 🚫 Soków, napojów gazowanych, surówek.
- 🚫 Świeżych owoców, orzechów.
- 🚫 Błonnika (substancji balastowych).

### Napoje:
- ✅ Herbata z kopru włoskiego, czarna lub zielona, kleik ryżowy, zupa na kleiku ryżowym.

### Reguła dla modelu:
```
IF biegunka (faza_ostra, < 24-48h):
  diet_protocol = "BRAT"
  meal.fiber = niski
  meal.fat = niski
  meal.lactose = brak
  blocked: [surowe, smazone, ostre, kawa, alkohol, gazowane, grube_kasze, pelnoziarniste]
  preferred: [banan_zielony, ryz_bialy, jablko_pieczone, tost_pszenny, marchew_gotowana, ziemniaki_puree]
  warning: "Jeśli biegunka > 24h lub się nasila — skontaktuj się z lekarzem"
```

---

## 8. `zaparcia` — Zaparcia

### Strategia: **dieta bogatoresztkowa** (bogatobłonnikowa)

Modyfikacja żywienia ogólnego — zwiększenie ilości błonnika nierozpuszczalnego i płynów.

### Mechanizm działania błonnika:
- zwiększa masę kałową,
- mechanicznie drażni — przyspiesza pasaż jelitowy,
- opóźnia hydrolizę skrobi i wchłanianie glukozy,
- daje uczucie sytości.

### Zalecane produkty:
- ✅ Naturalna **maślanka, kefir, jogurt naturalny** (+ otręby pszenne).
- ✅ Rzadka **owsianka na mleku.**
- ✅ Lekkie **zupy jarzynowe z dodatkiem kasz** (np. jęczmiennej).
- ✅ **Kawa espresso** / kompot z suszonych owoców i jabłek.
- ✅ **Woda o wysokiej zawartości magnezu.**
- ✅ Błonnik rozpuszczalny w preparatach: **Fibraxine, Colon C** (bez recepty).
- ✅ Warzywa gotowane (brokuł, kalafior — uwaga na wzdęcia), soki warzywne z dodatkiem oliwy/oleju.
- ✅ **Suszone śliwki** namoczone w wodzie.
- ✅ **Tarta marchew** z oliwą / olejem rzepakowym.
- ✅ **Suszone owoce**: morele, figi, rodzynki, śliwki.
- ✅ **Przed śniadaniem**: 1 szklanka **wody z miodem.**
- ✅ Pestki **dyni, słonecznika.**
- ✅ Mix sałat z sosem vinegrette / olejem.
- ✅ **Siemię lniane**, otręby pszenne / żytnie.
- ✅ Woda mineralna + sok owocowy / warzywny.
- ✅ **Grube kasze**: pęczak, gryczana.
- ✅ Owoce: jabłko, pomarańcze (jeśli dozwolone), śliwki, brzoskwinie.
- ✅ Kapusta kiszona, ogórki kwaszone, pomidory.
- ✅ Buraki, papryka, seler, szpinak, sałata, rabarbar.
- ✅ **Chłodne napoje i potrawy.**

> ⚠️ Uwaga: warzywa wzdymające (brokuł, kalafior, kapusta) mogą poprawić zaparcia, ale nasilić `wzdecia`. Decyduje przewaga objawu.

### Reguła dla modelu:
```
IF zaparcia AND NOT biegunka:
  diet_protocol = "bogatoresztkowa"
  meal.fiber_insoluble = wysoki
  meal.fluid_intake_recommendation = +500ml
  preferred: [otreby, suszone_sliwki, kefir, kasze_grube, siemie_lniane, surowe_warzywa, suszone_owoce]
  morning_routine: "1 szklanka wody z miodem przed śniadaniem"
```

---

## 9. `wzdecia` — Wzdęcia, gazy, uczucie pełności

### Unikać warzyw wzdymających:
- 🚫 groch,
- 🚫 kalafior,
- 🚫 kapusta,
- 🚫 brokuł,
- 🚫 soczewica,
- 🚫 cebula,
- 🚫 czosnek.

### Unikać:
- 🚫 napojów gazowanych,
- 🚫 dań tłustych, ciężkostrawnych,
- 🚫 słodyczy w dużych ilościach,
- 🚫 produktów fermentujących (np. **soku z buraka** w nadmiarze — nasila fermentację).

---

## 10. `zmeczenie` — Zmęczenie, brak siły

### Zalecenia:
- ✅ **Stałe pory posiłków** — pomagają utrzymać rytm dnia, wspierają regenerację.
- ✅ **Posiłki gotowe do podgrzania** (eliminacja wysiłku gotowania) — argument za cateringiem dietetycznym.
- ✅ **Wysokoenergetyczne, lekkie do strawienia** (nie obciążają trawienia).
- ✅ **Regularność** ważniejsza niż objętość — lepiej małe i często niż duże posiłki rzadko.

---

## 11. `niedozywienie` — Niedożywienie / spadek masy ciała

To **najpoważniejsze ryzyko** u pacjenta onkologicznego.

### Zalecenia:
- ✅ **Wysokokaloryczne, wysokobiałkowe** posiłki w małej objętości.
- ✅ **Wzbogacanie**: dodatek tłuszczów (masło, oleje, oliwa), białka (mleko w proszku), węglowodanów (miód) — patrz lista pod `brak_apetytu`.
- ✅ Jeżeli dieta doustna nie wystarcza → **FSMP** (food for special medical purposes) — preparaty medyczne, skoncentrowane.
- ✅ Konsultacja z **dietetykiem klinicznym.**
- ✅ Białko: **1,2–2 g / kg masy ciała / dobę.**

### Reguła dla modelu (alarmowa):
```
IF spadek_masy_ciala >= 5% w 1 mies. OR BMI < 18.5:
  flag = NIEDOZYWIENIE_RISK
  meal.energy_density = bardzo_wysoka
  meal.protein_density = bardzo_wysoka
  recommend_FSMP = TRUE
  alert_clinician = TRUE
```

---

## 12. `nietolerancja_laktozy` — Wtórna nietolerancja laktozy

### Charakterystyka:
- Często towarzyszy chemio/radioterapii (uszkodzenie enzymu rozkładającego laktozę).
- Objawy: bóle brzucha, wzdęcia, nudności, wymioty, biegunka po spożyciu mleka.

### Zalecenia:
- ✅ Wybierać **produkty bezlaktozowe.**
- ✅ **Fermentowane produkty mleczne** — jogurt, kefir, twaróg (mają zmniejszoną ilość laktozy i są zwykle dobrze tolerowane).
- ✅ Napoje sojowe / roślinne.
- 🚫 **Świeże mleko** — jeśli powoduje objawy.
- ⚠️ Eliminacja może być **czasowa** — po zakończeniu leczenia często powraca tolerancja.

---

## 13. `niechec_do_miesa` — Niechęć do mięsa, zapachu mięsa/ryb

### Charakterystyka:
- Bardzo częsty problem w trakcie chemioterapii.
- Zapach i smak ryb mogą wzmagać nudności i wymioty.

### Alternatywne źródła białka (dobrze tolerowane):
- ✅ **Jajka** — szczególnie **na miękko** lub w formie **jajecznicy** (najlepiej tolerowane).
- ✅ **Fermentowane produkty mleczne** (jeśli nie ma nietolerancji laktozy).
- ✅ **Twaróg, serek homogenizowany.**
- ✅ Roślinne źródła białka (**uwaga**: czasem słabo tolerowane podczas terapii).

### Zalecenia podawania mięsa, jeśli pacjent toleruje:
- Mięso w sosach (nie suche).
- Pulpety / mielone (zamiast kawałków).
- Mięso jako składnik zupy / dania jednogarnkowego.
- **Zimne mięso** (galaretka, tymbalik) zamiast gorącego — mniej intensywny zapach.

---

## Tabela zbiorcza: objaw → konsystencja + temperatura

Bardzo użyteczna jako prosty lookup table dla wstępnego modelu opartego na regułach.

| Objaw | Konsystencja preferowana | Temperatura | Profil smaku | Kalorie | Białko |
|-------|--------------------------|-------------|--------------|---------|--------|
| `nudnosci_wymioty` | suche skrobiowe + płynne chłodne | chłodna / pokojowa | neutralny, lekko słony | małe porcje | normalne |
| `brak_apetytu` | puree, koktajl, zupa krem, mus | dowolna (zimne stymuluje) | kwaśny / lekko słony | wysokokaloryczne | wysokobiałkowe |
| `zmiana_smaku` | dowolna miękka | dowolna | neutralny, kwaśny | wysokokaloryczne | wysokobiałkowe |
| `zapalenie_jamy_ustnej` | puree, krem, papka, mus | pokojowa | łagodny (nieostry, niekwaśny, niesłony) | wysokokaloryczne | wysokobiałkowe |
| `suchosc_jamy_ustnej` | wilgotna, z sosem | pokojowa | dowolny | normalne | normalne |
| `dysfagia` | półpłynna, papkowata, krem | pokojowa | łagodny | wysokokaloryczne | wysokobiałkowe |
| `biegunka` | gęsta, zapierająca (ryż, banan) | pokojowa / ciepła | łagodny, lekko słony | normalne | umiarkowane |
| `zaparcia` | bogatobłonnikowa | chłodna lub pokojowa | dowolny | normalne | normalne |
| `wzdecia` | lekka, niewzdymająca | pokojowa | łagodny | normalne | normalne |
| `zmeczenie` | dowolna lekkostrawna | dowolna | dowolny | wysokokaloryczne | wysokobiałkowe |
| `niedozywienie` | wzbogacona, gęsta kalorycznie | dowolna | dowolny preferowany | bardzo wysokie | bardzo wysokie |
| `nietolerancja_laktozy` | bezlaktozowa | dowolna | dowolny | normalne | normalne |
| `niechec_do_miesa` | bez mięsa / mięso w sosie/zimne | pokojowa / zimna | neutralny | wysokokaloryczne | wysokobiałkowe (jajka, twaróg) |

---

## Konflikty objawów (ważne dla modelu)

Pacjent może mieć **wiele objawów jednocześnie** — i zalecenia bywają sprzeczne. Reguły rozstrzygania:

| Konflikt | Rozstrzygnięcie |
|----------|-----------------|
| `biegunka` + `zaparcia` (rotacyjnie) | Priorytet ma **objaw aktualny**. Model musi mieć timestamp objawu. |
| `zaparcia` + `wzdecia` | Wybieraj błonnik **rozpuszczalny** (kefir, owsianka, jabłka) zamiast wzdymających warzyw kapustnych. |
| `brak_apetytu` + `nudnosci_wymioty` | Priorytet: **nudności** (najpierw opanować, potem dosycać). Małe porcje, chłodne, suche. |
| `zapalenie_jamy_ustnej` + `niedozywienie` | Konsystencja papkowata + **wzbogacanie kaloryczne** (masło, oleje, mleko w proszku, FSMP). |
| `niechec_do_miesa` + `niedozywienie` | Białko z **jajek, fermentowanych produktów mlecznych, FSMP**. |
| `dysfagia` + `suchosc_jamy_ustnej` | Konsystencja **półpłynna z dużą ilością sosu**, picie częste małymi łykami. |

---

## Format machine-readable (przykład YAML do ewentualnego użycia w aplikacji)

```yaml
symptoms:
  nudnosci_wymioty:
    label_pl: Nudności i wymioty
    severity_levels: [łagodne, umiarkowane, ciężkie]
    diet:
      meal_size: małe
      meal_frequency_h: 2-3
      temperature: [chłodna, pokojowa]
      aroma: niska
      fat: niska
      sugar: niska
    preferred_foods:
      - krakersy
      - suchary
      - tosty
      - mus_owocowy
      - galaretka
      - kostki_lodu
      - ananas_mrozony
      - imbir_w_herbacie
    avoid_foods:
      - tluste
      - bardzo_slodkie
      - wzdymajace
      - mocno_pachnace
      - zageszczone_zupy_sosy
    posture: pionowa_po_posilku
```

Pełny YAML dla wszystkich objawów do wygenerowania w fazie implementacji (patrz `08-model-predykcji-cechy.md`).
