# 04 · Konsystencje i warianty diety onkologicznej

## 1. Trzy główne warianty diety (wg „Pacjent Wybiera")

| Wariant | Klucz | Kontekst | Profil |
|---------|-------|----------|--------|
| **W trakcie leczenia** | `wariant_w_trakcie_leczenia` | Pacjent w aktywnym leczeniu, ale bez intensywnych skutków ubocznych | Pełnowartościowa, lekkostrawna, urozmaicona. |
| **W trakcie radio- i chemioterapii** | `wariant_radio_chemio` | Aktywna chemio/radioterapia z objawami ubocznymi | Najbardziej restrykcyjna: neutralny smak, miękka konsystencja, łatwostrawna. |
| **W remisji / rekonwalescencji** | `wariant_remisja` | Po zakończonym leczeniu | Bliżej diety zdrowej osoby, profilaktyczna, urozmaicona. |

> Źródło: pacjentwybiera.pl/dieta/dieta-onkologiczna — opis wariantów diety onkologicznej.

### Założenia wszystkich wariantów (z opisu „Pacjent Wybiera")

- ✅ Wysoka wartość odżywcza i kaloryczna
- ✅ Łatwa do spożycia i lekkostrawna
- ✅ Zwiększona zawartość białka
- ✅ Minimalizacja ryzyka niedoborów
- ✅ Dostosowanie do indywidualnych objawów

## 2. Konsystencje diety

W trakcie leczenia często konieczna jest modyfikacja konsystencji potraw, aby maksymalnie odciążyć przewód pokarmowy lub ułatwić przełykanie.

| Konsystencja | Klucz | Wskazania | Przykłady |
|--------------|-------|-----------|-----------|
| **Standardowa** | `standardowa` | Brak istotnych dolegliwości | Klasyczne dania |
| **Lekkostrawna** | `lekkostrawna` | Większość pacjentów onkologicznych | Gotowane, na parze, w folii |
| **Lekkostrawna wzbogacona / wysokobiałkowa** | `lekkostrawna_wysokobialkowa` | Niedożywienie, zwiększone zapotrzebowanie białkowe | + dodatek białka, mleka w proszku, jaj |
| **Papkowata** | `papkowata` | Trudności w gryzieniu, łagodne dysfagia, zapalenie jamy ustnej | Pulpety, miękkie kasze, puree z dodatkami |
| **Płynna wzmocniona** | `plynna_wzmocniona` | Ciężkie zapalenie jamy ustnej / przełyku, dysfagia umiarkowana | Zupy krem zmiksowane z dodatkiem białka i tłuszczu |
| **Płynna** | `plynna` | Bardzo ciężka dysfagia, stan po operacji | Kleiki, koktajle, FSMP |

### Modyfikacja w praktyce
- Płynna i płynna wzmocniona zwykle podawane jako **400 ml zmiksowanego posiłku** (patrz `07-jadlospisy-przykladowe.md`).
- Każdy posiłek w wariancie płynnym zawiera białko + tłuszcz + węglowodan + warzywo (zmiksowane razem).

## 3. Protokoły dietetyczne (specjalne)

| Protokół | Klucz | Cel | Czas trwania | Charakterystyka |
|----------|-------|-----|--------------|-----------------|
| **BRAT** | `protokol_BRAT` | Biegunka — pierwsze 24–48 h | **Max 1–2 dni** | Niskokaloryczna, niskobłonnikowa, niskotłuszczowa |
| **Bogatoresztkowa (bogatobłonnikowa)** | `protokol_bogatoresztkowa` | Zaparcia | Trwale do ustąpienia | + błonnik nierozpuszczalny + płyny |
| **Wysokobiałkowa** | `protokol_wysokobialkowa` | Niedożywienie, sarkopenia | Trwale | 1,2–2 g białka / kg m.c. / dobę |
| **Wysokoenergetyczna** | `protokol_wysokoenergetyczna` | Niedożywienie, brak apetytu | Trwale | Wzbogacanie tłuszczami i białkiem |
| **Bezlaktozowa** | `protokol_bezlaktozowa` | Wtórna nietolerancja laktozy | Czasowo | Eliminacja laktozy lub fermentowane produkty mleczne |
| **FSMP — żywienie medyczne** | `protokol_FSMP` | Gdy dieta doustna nie pokrywa zapotrzebowania | Wg wskazań | Preparaty Nutridrink, Resource itp. |

## 4. Mapa: konsystencja × objaw

Macierz pomocnicza dla rekomendacji.

| Objaw \ Konsystencja | standardowa | lekkostrawna | lekkostrawna+białko | papkowata | płynna wzm. | płynna |
|---|---|---|---|---|---|---|
| `nudnosci_wymioty` | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| `brak_apetytu` | ⚠️ | ✅ | ✅ ⭐ | ✅ ⭐ | ✅ ⭐ | ⚠️ |
| `zapalenie_jamy_ustnej` | 🚫 | ⚠️ | ⚠️ | ✅ ⭐ | ✅ ⭐ | ✅ |
| `suchosc_jamy_ustnej` | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `dysfagia` | 🚫 | 🚫 | 🚫 | ✅ ⭐ | ✅ ⭐ | ✅ ⭐ |
| `biegunka` | 🚫 | ✅ ⭐ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| `zaparcia` | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | 🚫 |
| `wzdecia` | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `niedozywienie` | ⚠️ | ⚠️ | ✅ ⭐ | ✅ ⭐ | ✅ ⭐ | ✅ ⭐ + FSMP |
| `niechec_do_miesa` | ⚠️ | ✅ | ✅ (białko z jaj) | ✅ | ✅ | ✅ |

⭐ = pierwszy wybór · ✅ = OK · ⚠️ = warunkowo · 🚫 = nie

## 5. Reguła wyboru wariantu (dla modelu)

```
def wybierz_wariant(pacjent, objawy):
    if pacjent.faza_leczenia == "remisja":
        return "wariant_remisja"
    if "chemioterapia" in pacjent.terapie or "radioterapia" in pacjent.terapie:
        return "wariant_radio_chemio"
    if pacjent.faza_leczenia in ("aktywne_leczenie", "hormonoterapia", "immunoterapia"):
        return "wariant_w_trakcie_leczenia"
    return "wariant_w_trakcie_leczenia"  # default

def wybierz_konsystencje(objawy, stan):
    # priorytet: dysfagia > zapalenie_jamy_ustnej > niedozywienie > brak_apetytu
    if "dysfagia" in objawy and stan.dysfagia_severity == "ciezka":
        return "plynna"
    if "dysfagia" in objawy or "zapalenie_jamy_ustnej" in objawy:
        return "papkowata" if stan.severity == "umiarkowana" else "plynna_wzmocniona"
    if "niedozywienie" in objawy or "brak_apetytu" in objawy:
        return "lekkostrawna_wysokobialkowa"
    if "biegunka" in objawy:
        return "lekkostrawna"  # + protokol BRAT
    return "lekkostrawna"
```
