# 03 · Produkty zalecane i przeciwwskazane

> Tabele produktów z trzech źródeł: Lublin 2019, NIO Kraków, „Pacjent Wybiera". Każdy produkt ma klucz `snake_case`, kategorię i status (zalecany / kontrolowany / przeciwwskazany).
>
> Tabele te są **słownikiem cech** dla feature engineeringu posiłków — każdy posiłek w aplikacji powinien być oznaczony tagami z tej listy.

## Legenda

- ✅ **ZALECANY** — można jeść swobodnie, dieta wskazana.
- ⚠️ **KONTROLOWANY** — można jeść, ale tylko w określonych warunkach (np. „tylko jeśli nie ma biegunki", „w ograniczonych ilościach").
- 🚫 **PRZECIWWSKAZANY** — należy unikać w czasie leczenia onkologicznego.
- 🛑 **BEZWZGLĘDNIE ZAKAZANY** — bezwzględny zakaz (interakcje z lekami, ryzyko zatrucia).

---

## 1. Mięso i wędliny

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `mieso_chude_drob` | Drób chudy: indyk, kurczak | ✅ | Główne źródło białka. |
| `mieso_chude_krolik` | Królik | ✅ | Lekkostrawne. |
| `mieso_chude_cielecina` | Cielęcina | ✅ | |
| `mieso_chude_wieprzowina_szynka_schab_poledwica` | Chuda wieprzowina (szynka, schab, polędwiczka) | ✅ | Bez tłustych części. |
| `mieso_czerwone_wolowina_wieprzowina_jagniecina` | Wołowina, wieprzowina (tłusta), jagnięcina | ⚠️ | **Max 1× w tygodniu** ze względu na zawartość tłuszczu. |
| `wedliny_konserwowane` | Wędliny, parówki, kiełbasy, pasztety przemysłowe | 🚫 | Duża ilość soli, tłuszczu, konserwantów. |
| `mieso_wedzone` | Mięso wędzone | 🚫 | Substancje pirolizy, N-nitrozaminy. |
| `mieso_peklowane` | Mięso peklowane | 🚫 | N-nitrozaminy. |
| `mieso_surowe_tatar_sushi` | Surowe mięso (tatar), sushi | 🚫 | Ryzyko mikrobiologiczne — szczególnie u immunokompromitowanych. |
| `fastfood` | Fast food | 🚫 | Tłuszcze trans, sól. |
| `grill_wegiel` | Potrawy z grilla na węglu drzewnym, mocno odymione | 🚫 | Substancje rakotwórcze (akrylamid, WWA). |

---

## 2. Ryby i jaja

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `ryby_chude_gotowane_pieczone` | Ryby chude gotowane / pieczone (np. dorsz, sandacz) | ✅ | Białko + omega-3. |
| `ryby_tluste_morskie` | Ryby tłuste morskie (łosoś, makrela) | ✅ | Bogate w omega-3, jedna z bezpiecznych form suplementacji. |
| `ryby_surowe_sushi` | Ryby surowe (sushi) | 🚫 | Ryzyko mikrobiologiczne. |
| `jajka_na_miekko` | Jajka na miękko | ✅ | **Bardzo dobrze tolerowane źródło białka** w trakcie chemioterapii. |
| `jajka_jajecznica_para` | Jajecznica na parze | ✅ | Idealne przy `niechec_do_miesa`. |
| `jajka_na_twardo` | Jajka na twardo | ✅ | Działają zapierająco — uwaga przy zaparciach. |

---

## 3. Mleko i przetwory

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `mleko_swieze` | Mleko świeże (krowie) | ⚠️ | OK, jeśli brak nietolerancji laktozy. Częsta wtórna nietolerancja w chemio/radioterapii. |
| `mleko_surowe` | Mleko surowe | 🚫 | Ryzyko mikrobiologiczne. |
| `mleko_bezlaktozowe` | Mleko bezlaktozowe | ✅ | Bezpieczna alternatywa. |
| `mleko_roslinne_sojowe` | Napoje sojowe / roślinne | ✅ | Zalecane przy nietolerancji laktozy. |
| `kefir` | Kefir | ✅ | Fermentowane — niska laktoza, dobrze tolerowane. |
| `maslanka` | Maślanka | ✅ | Wspomaga przy zaparciach. |
| `jogurt_naturalny` | Jogurt naturalny | ✅ | Białko + probiotyki. |
| `twarog` | Twaróg | ✅ | Białko, niska laktoza. |
| `serek_homogenizowany_naturalny` | Serek homogenizowany naturalny | ✅ | Łagodny — przy zapaleniu jamy ustnej. |
| `sery_pleśniowe` | Sery pleśniowe (rokpol, brie, camembert) | 🚫 | Pleśń + ryzyko mikrobiologiczne. |
| `sery_zolte_tluste` | Sery żółte tłuste | ⚠️ | Ciężkostrawne, w ograniczonych ilościach. |
| `sery_zolte_chude` | Sery żółte chude | ⚠️ | OK w niewielkich ilościach. |

---

## 4. Warzywa

### Zalecane (gotowane / młode / liściaste)

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `warzywa_szpinak` | Szpinak | ✅ | Liściaste zielone. |
| `warzywa_salata` | Sałata | ✅ | Liściaste. |
| `warzywa_pietruszka_nac` | Natka pietruszki | ✅ | Aromat, witaminy. |
| `warzywa_marchew` | Marchew (gotowana, surowa, tarta) | ✅ | Wszechstronne — zapierająca przy biegunce. |
| `warzywa_dynia` | Dynia | ✅ | Łagodna, słodkawa. |
| `warzywa_seler` | Seler | ✅ | Młody, gotowany. |
| `warzywa_kabaczek` | Kabaczek | ✅ | Lekkostrawny. |
| `warzywa_patison` | Patison | ✅ | |
| `warzywa_cukinia` | Cukinia | ✅ | Lekkostrawna. |
| `warzywa_burak_gotowany` | Buraki gotowane | ✅ | Bogate w składniki odżywcze. |
| `warzywa_pomidor_bs` | Pomidor (bez skórki) | ✅ | |
| `warzywa_papryka` | Papryka | ⚠️ | OK przy zaparciach; unikać przy zapaleniu jamy ustnej. |

### Wzdymające (przeciwwskazane przy `wzdecia`)

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `warzywa_groch` | Groch | 🚫 wzdymające | |
| `warzywa_kalafior` | Kalafior | 🚫 wzdymające | Ale OK w małych ilościach przy zaparciach (bez wzdęć). |
| `warzywa_kapusta` | Kapusta (świeża, biała) | 🚫 wzdymające | Kiszona — OK przy zaparciach (z umiarem). |
| `warzywa_brokul` | Brokuł | 🚫 wzdymające | |
| `warzywa_soczewica` | Soczewica | 🚫 wzdymające | |
| `warzywa_cebula` | Cebula | 🚫 wzdymające | |
| `warzywa_czosnek` | Czosnek | 🚫 wzdymające | |

### Przeciwwskazane formy

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `warzywa_surowe_ogolnie` | Surowe warzywa (ogólnie) | ⚠️ | **Przy biegunce — unikać.** Przy zaparciach — zalecane. |
| `warzywa_psute_plesn` | Warzywa nieświeże, z pleśnią | 🚫 | |

### Specjalne

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `warzywa_kapusta_kiszona` | Kapusta kiszona | ⚠️ ZALECANA przy zaparciach | Wzdymająca — uwaga przy `wzdecia`. |
| `warzywa_ogorek_kwaszony` | Ogórki kwaszone | ⚠️ ZALECANE przy zaparciach | Lekko słone — pomocne przy braku apetytu. |
| `warzywa_szpinak_gotowany` | Szpinak gotowany | ✅ | Bogatoresztkowy. |
| `warzywa_rabarbar` | Rabarbar | ⚠️ | Pomocny przy zaparciach. |

---

## 5. Owoce

### Zalecane

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `owoce_banan` | Banan | ✅ | **Mało dojrzały** — zapierający (BRAT); dojrzały — energia. |
| `owoce_jablko_pieczone` | Jabłko pieczone / mus z gotowanego jabłka | ✅ | Pektyny — pomocne przy biegunce. |
| `owoce_avocado` | Awokado | ✅ | Tłuszcz — wzbogaca kalorycznie posiłki. |
| `owoce_melon` | Melon | ✅ | Łagodny smak — przy zapaleniu jamy ustnej. |
| `owoce_arbuz` | Arbuz (mrożone kawałki) | ✅ | Stymuluje smak przy zmianie smaku. |
| `owoce_morele_suszone` | Morele suszone | ⚠️ ZALECANE przy zaparciach | Działają na motorykę jelit. |
| `owoce_figi_suszone` | Figi suszone | ⚠️ ZALECANE przy zaparciach | |
| `owoce_rodzynki` | Rodzynki | ⚠️ ZALECANE przy zaparciach | |
| `owoce_sliwki_suszone` | Śliwki suszone (namoczone) | ⚠️ ZALECANE przy zaparciach | |
| `owoce_brzoskwinia` | Brzoskwinia | ✅ | Pomocna przy zaparciach. |
| `owoce_jagody_borowki` | Jagody, borówki | ✅ | Antyoksydanty. |
| `owoce_maliny` | Maliny (zmrożone do ssania, sok) | ✅ | Stymulacja smaku. |
| `owoce_truskawki_mrozone` | Truskawki mrożone | ✅ | Stymulacja smaku przy braku apetytu. |
| `owoce_truskawki_swieze` | Truskawki świeże | ⚠️ | Surowe — uważać przy biegunce. |

### Przeciwwskazane / kontrolowane

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `owoce_grejpfrut` | Grejpfrut i jego przetwory | 🛑 BEZWZGLĘDNIE | **Interakcje z chemioterapią!** Bezwzględny zakaz w trakcie leczenia. |
| `owoce_pomelo` | Pomelo | 🛑 | Tak jak grejpfrut. |
| `owoce_granat` | Granat | 🛑 | Nie zalecany (interakcje). |
| `owoce_pomarancza` | Pomarańcze | 🚫 | Cytrusy — kwaśne, drażniące przy zapaleniu jamy ustnej. Mogą interagować. |
| `owoce_kiwi` | Kiwi | 🚫 | Cytrusy w szerokim sensie. |
| `owoce_mandarynka` | Mandarynki | 🚫 | |
| `owoce_porzeczka` | Porzeczki | 🚫 | Bardzo kwaśne. |
| `owoce_sliwki_swieze` | Śliwki świeże (surowe) | ⚠️ | Mogą drażnić; suszone — OK. |
| `owoce_wisnie_czeresnie_swieze` | Wiśnie, czereśnie świeże | ⚠️ | Surowe — uważać. |
| `owoce_pestki_moreli_amigdalina` | Pestki moreli (amigdalina) | 🛑 BEZWZGLĘDNIE | **Ryzyko zatrucia cyjankami.** Patrz `06-mity-zywieniowe.md`. |

---

## 6. Pieczywo, kasze, makarony

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `pieczywo_pszenne_bia\u0142e` | Pieczywo pszenne białe | ✅ | Lekkostrawne. |
| `pieczywo_grahamka` | Grahamka, chleb żytni | ⚠️ | Ciemne pieczywo — przy biegunce unikać; przy zaparciach zalecane. |
| `pieczywo_paluszki_krakersy_solone` | Słone paluszki, krakersy | ⚠️ ZALECANE przy braku apetytu/nudnościach | |
| `pieczywo_namoczone_w_mleku` | Pieczywo namoczone w mleku | ✅ | Zapalenie jamy ustnej. |
| `pieczywo_tost_pszenny_lekko_czerstwy` | Tost pszenny lekko czerstwy | ✅ | Dieta BRAT. |
| `kasza_manna` | Kasza manna (grysik) | ✅ | Drobna, łagodna — przy biegunce. |
| `kasza_kuskus` | Kuskus | ✅ | Drobna kasza. |
| `kasza_jaglana` | Kasza jaglana | ✅ | Drobna, łagodna. |
| `kasza_jeczmienna` | Kasza jęczmienna | ✅ | Średnia — w zupach jarzynowych. |
| `kasza_peczak` | Kasza pęczak | ⚠️ | Gruba — przy zaparciach; nie przy biegunce. |
| `kasza_gryczana` | Kasza gryczana | ⚠️ | Gruba — j.w. |
| `makaron_drobny_dobrze_ugotowany` | Makaron drobny dobrze ugotowany | ✅ | Lekkostrawny. |
| `ryz_bialy` | Ryż biały (kleik, gotowany) | ✅ | Dieta BRAT, zapierający. |
| `pelnoziarniste` | Produkty pełnoziarniste | ⚠️ | Zalecane na co dzień, **unikać przy biegunce.** |

---

## 7. Tłuszcze

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `oliwa_z_oliwek` | Oliwa z oliwek | ✅ | Zalecana w niewielkich ilościach. |
| `olej_rzepakowy` | Olej rzepakowy | ✅ | Zalecany. |
| `olej_lniany` | Olej lniany | ✅ | Zalecany — omega-3. |
| `maslo_extra` | Masło ekstra | ✅ | Wzbogacanie kaloryczne posiłków. |
| `mleko_kokosowe` | Mleko kokosowe | ✅ | Wzbogacanie kaloryczne. |
| `awokado` | Awokado | ✅ | Wzbogacanie. |
| `orzechy_zmielone` | Orzechy zmielone | ✅ | Wzbogacanie kaloryczne, **uwaga**: pleśń, alergie. |
| `zoltko` | Żółtko jajka | ✅ | Wzbogacanie. |
| `tluszcze_smazone` | Tłuszcze ze smażenia | 🚫 | |
| `tluszcze_trans` | Tłuszcze trans (margaryny przemysłowe) | 🚫 | |

---

## 8. Słodycze, słodzenie

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `slodycze_w_duzych_ilosciach` | Słodycze w dużych ilościach | 🚫 | Cukry proste, dodatki chemiczne. |
| `miod_naturalny` | Miód naturalny | ✅ | Zalecany jako naturalny słodzik. |
| `cukier_brzozowy_ksylitol` | Cukier brzozowy (ksylitol) | ✅ | Naturalny słodzik. |
| `produkty_przetworzone_dodatki_chemiczne` | Produkty przetworzone z dodatkami chemicznymi, polepszaczami, sztucznymi barwnikami, glutaminianem sodu | 🚫 | |
| `gorzka_czekolada` | Gorzka czekolada | ⚠️ ZALECANA przy biegunce | Działa zapierająco. |

---

## 9. Przyprawy i zioła

### Zalecane (delikatne, naturalne)

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `sok_z_cytryny` | Sok z cytryny | ✅ | Stymuluje smak. |
| `wanilia` | Wanilia | ✅ | |
| `cynamon` | Cynamon | ⚠️ | Ostrożnie przy zapaleniu jamy ustnej. |
| `koper_swiezy` | Koper świeży / koperek | ✅ | |
| `pietruszka_nac` | Natka pietruszki | ✅ | |
| `melisa` | Melisa | ✅ | |
| `bazylia` | Bazylia | ✅ | |
| `tymianek` | Tymianek | ✅ | |
| `rozmaryn` | Rozmaryn | ✅ | |
| `czaber` | Cząber | ✅ | |
| `mieta` | Mięta | ✅ | Łagodzi nudności. |
| `imbir_swiezy` | Imbir świeży (do herbaty) | ✅ przy nudnościach | 🚫 przy zapaleniu jamy ustnej (rozgrzewający). |
| `kurkuma` | Kurkuma | ✅ | Dodatek do herbaty/wody. |
| `gozdziki` | Goździki | ⚠️ | Przy nudnościach — OK w herbacie; przy zapaleniu jamy ustnej — unikać. |
| `kardamon` | Kardamon | ⚠️ | J.w. |

### Przeciwwskazane

| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `przyprawy_pikantne_ostre` | Pikantne, ostre przyprawy (pieprz cayenne, chili, ostra papryka) | 🚫 | Drażnią przewód pokarmowy. |
| `olejki_aromatyczne_korzenne_w_nadmiarze` | Olejki aromatyczne z przypraw korzennych w nadmiarze | 🚫 | Czynnik ryzyka. |
| `glutaminian_sodu` | Glutaminian sodu | 🚫 | |

---

## 10. Specjalne grupy

### Galaretki, kisiele, budynie, musy
| Klucz | Produkt | Status | Uwagi |
|-------|---------|--------|-------|
| `galaretka_owocowa` | Galaretka owocowa | ✅ | Łagodna, wilgotna. |
| `galaretka_miesna` | Galaretka mięsna (żelatyna) | ✅ | Działa zapierająco. |
| `kisiel` | Kisiel | ✅ | Łagodny. |
| `budyn` | Budyń | ✅ | Mleczny, kaloryczny. |
| `mus_owocowy` | Mus owocowy | ✅ | Łagodzi nudności. |
| `koktajl_mleczny_owocowy` | Koktajl mleczny / owocowy | ✅ | Wysokokaloryczny w małej objętości. |

### Soki
Patrz `05-napoje-i-nawodnienie.md`.

---

## 11. Zakazy bezwzględne (TOP) — szybka ściąga dla modelu

```
HARD_CONSTRAINTS_DURING_CHEMOTHERAPY = [
  "grejpfrut",                # interakcje z lekami
  "pomelo",                   # j.w.
  "granat",                   # j.w.
  "dziurawiec",               # interakcje
  "tatar_surowe_mieso",       # ryzyko mikrobiologiczne
  "sushi_surowa_ryba",        # j.w.
  "sery_plesniowe",           # j.w. + pleśń
  "produkty_z_plesnia",       # mykotoksyny
  "pestki_moreli_amigdalina", # cyjanki
  "ziola_wyciagi_roslinne_bez_konsultacji",
  "witaminy_skladniki_mineralne_bez_konsultacji",
]

SAFE_SUPPLEMENTS = [
  "witamina_d3",
  "kwasy_omega_3",
]
```

---

## 12. Tagi posiłku — propozycja schematu dla `data.ts`

Każdy posiłek w aplikacji powinien mieć następujące tagi:

```ts
interface MealTags {
  consistency: 'placzca'|'plynna'|'papkowata'|'krem'|'puree'|'mieszana'|'standardowa';
  temperature_recommended: 'zimna'|'pokojowa'|'cieplo'|'gorąca';
  taste_profile: ('neutralny'|'lekko_slony'|'kwasny'|'lekko_slodki'|'gorzki')[];
  energy_density: 'niska'|'srednia'|'wysoka'|'bardzo_wysoka';   // kcal/g
  protein_density: 'niska'|'srednia'|'wysoka'|'bardzo_wysoka';
  fiber_level: 'niski'|'sredni'|'wysoki';
  fat_level: 'niski'|'sredni'|'wysoki';
  lactose: 'brak'|'sladowa'|'pelna';
  contains: string[];        // klucze produktów z tej tabeli
  contraindicated_for_symptoms: SymptomKey[];   // np. ['biegunka', 'wzdecia']
  recommended_for_symptoms: SymptomKey[];       // np. ['nudnosci_wymioty']
  diet_protocol_compatible: ('BRAT'|'bogatoresztkowa'|'lekkostrawna'|'wysokobialkowa')[];
}
```

To jest gotowy schemat do zaimplementowania w `frontend/src/types.ts` i `data.ts`.
