# 06 · Mity żywieniowe w onkologii

> Mity są zebrane z dokumentu Narodowego Instytutu Onkologii (Oddział w Krakowie, „Zalecenia diety podczas chemioterapii"). Każdy mit zawiera **wersję rozpowszechnianą** i **odpowiedź naukową** wraz z konsekwencjami dla aplikacji.

Cel rozdziału:
1. **Treści edukacyjne** w aplikacji (sekcja FAQ / „Wiedza").
2. **Filtr poprawności** dla treści generowanych przez model — bezpieczeństwo informacyjne.
3. **Test regresyjny** — model nie powinien proponować rekomendacji opartych na tych mitach.

---

## Mit 1 — „Sok z buraka korzystnie wpływa na poziom hemoglobiny"

### Wersja rozpowszechniona
„Pij sok z buraka, podniesie ci hemoglobinę / wyleczy anemię."

### Odpowiedź naukowa
> Niewielka ilość **żelaza niehemowego** w składzie buraka **nie pozwala na poprawę parametrów biochemicznych krwi.** Sok z buraka stanowi ważny element prawidłowo zbilansowanej diety dzięki bogatemu składowi (witaminy, antyoksydanty), ale **nie podnosi poziomu hemoglobiny.**
>
> Z drugiej strony, **sporą ilość skrobi** w swoim składzie — przyczynia się do nasilonych procesów fermentacyjnych w jelitach, które u pacjentów chemio/radio mogą wywołać **wzdęcia i biegunki.**

### Konsekwencja dla modelu / aplikacji
- Sok z buraka: ⚠️ KONTROLOWANY, nie polecać przy `wzdecia` ani `biegunka`.
- **Nie sugerować** soku z buraka jako leku na anemię.
- W razie anemii — kierować do lekarza (suplementacja żelaza wymaga diagnostyki).

---

## Mit 2 — „W trakcie chemioterapii nie należy pić mleka"

### Wersja rozpowszechniona
„Mleko jest zakazane podczas chemioterapii."

### Odpowiedź naukowa
> Jeżeli po spożyciu mleka lub mlecznych napojów fermentowanych **nie występują dolegliwości** związane z przewodem pokarmowym (bóle brzucha, wzdęcia, nudności, wymioty), to jest to **produkt bezpieczny** w diecie pacjenta onkologicznego.
>
> Jeżeli jednak w okresie chemio/radio dojdzie do **nietolerancji mleka** związanego z uszkodzeniem enzymu rozkładającego cukier mleczny (laktazy), pojawią się dolegliwości — wówczas należy ten produkt **wyeliminować z diety na jakiś czas.**
>
> Wtedy zwykle **dobrze tolerowane są mleczne produkty fermentowane** — jogurt, kefir, twaróg — ze względu na **zmniejszoną ilość laktozy** w ich składzie.

### Konsekwencja dla modelu / aplikacji
- Mleko ≠ zakaz globalny. Tagujemy produkty laktozowe i pytamy o nietolerancję.
- Przy `nietolerancja_laktozy` flag: zamieniamy mleko na fermentowane lub bezlaktozowe.

---

## Mit 3 — „Białko mięsa karmi raka"

### Wersja rozpowszechniona
„Nie jedz mięsa, bo karmisz nowotwór."

### Odpowiedź naukowa
> **Łatwostrawne, bogate w białko mięso jest bezpieczne dla pacjentów onkologicznych.** Są to: mięso kurczaka, królika, indyka oraz cielęcina.
>
> Białko zwierzęce można znaleźć również w **rybach i jajach.**
>
> Należy jednak pamiętać, że **mięso czerwone (wołowinę, wieprzowinę, jagnięcinę) zaleca się spożywać raz w tygodniu** ze względu na wysoką zawartość tłuszczu.
>
> **Wędliny, parówki, kiełbasy i pasztety** zawierają dużą ilość soli, tłuszczu oraz konserwantów — należy minimalizować ich spożycie.
>
> Białko pochodzenia roślinnego również jest cenne, ale **podczas terapii onkologicznych bywa słabo tolerowane** przez organizm.

### Konsekwencja dla modelu / aplikacji
- Białko (1,2–2 g/kg/dobę) to **kluczowa cecha jakości diety** — model promuje wysokobiałkowe posiłki.
- Nie eliminujemy mięsa — tylko **prefereujemy chude (drób, indyk, królik, cielęcina)** i ograniczamy czerwone mięso oraz przetworzone wędliny.

---

## Mit 4 — „Cukier żywi raka"

### Wersja rozpowszechniona
„Wykluczam wszystkie węglowodany, bo glukoza karmi nowotwór."

### Odpowiedź naukowa
> **Węglowodany to podstawowa grupa składników odżywczych** dla ludzkiego organizmu — w diecie zdrowego człowieka powinny stanowić **45–55%** wartości energetycznej.
>
> Węglowodany dzielimy na **cukry proste** (powinny być ograniczone do <10%) i **cukry złożone** (fundament zdrowej diety).
>
> Cukry proste (glukoza, fruktoza, laktoza, sacharoza) oraz skrobia są wszechobecne — **nie da się ich całkowicie wyeliminować.**
>
> **Wszystkie komórki potrzebują glukozy do pozyskiwania energii** niezbędnej do życia. Największe zapotrzebowanie mają komórki nerwowe i krwinki czerwone — żyją wyłącznie dzięki glukozie i nie potrafią pozyskiwać energii z innych źródeł.
>
> Komórka nowotworowa również potrzebuje glukozy, ale **to inne dobrze funkcjonujące komórki, układy i narządy warunkują możliwość leczenia onkologicznego** i dają potencjał do rekonwalescencji po leczeniu.

### Konsekwencja dla modelu / aplikacji
- **Nie proponujemy** diety bezwęglowodanowej (ketogenicznej) jako wsparcia leczenia bez wskazania lekarza.
- **Ograniczamy** cukry proste (słodycze, słodzone napoje), ale **nie eliminujemy** węglowodanów.
- W aplikacji: jasny komunikat „Twój organizm potrzebuje energii — węglowodany złożone są dozwolone i potrzebne."

---

## Mit 5 — „Pestki moreli (amigdalina) leczą raka"

### Wersja rozpowszechniona
„Witamina B17 / amigdalina z pestek moreli jest naturalnym lekiem na raka."

### Odpowiedź naukowa
> **Żaden wiarygodny instytut nie potwierdził skuteczności** stosowania ani **bezpiecznej dawki terapeutycznej** dla amigdaliny.
>
> **Nadmierna suplementacja amigdaliny może doprowadzić do zatrucia organizmu cyjankami.**
>
> W przypadku intensywnego leczenia onkologicznego spożycie pestek owoców może wywołać **niestrawność**: bóle brzucha, wymioty, biegunkę, gorycz w ustach, „gorzkie odbijanie".
>
> Wszystkie te efekty mogą **obciążać przewód pokarmowy i zmniejszać tolerancję leczenia.**

### Konsekwencja dla modelu / aplikacji
- Amigdalina / pestki moreli: 🛑 **BEZWZGLĘDNIE ZAKAZANE.**
- W treściach edukacyjnych aplikacji jasno odradzamy.
- Lista zakazów `HARD_CONSTRAINTS` zawiera `pestki_moreli_amigdalina`.

---

## Mit 6 (z dokumentu Lublin 2019) — implicit: „Surowe warzywa i owoce zawsze są zdrowe"

### Wersja rozpowszechniona
„Im więcej surowizny, tym lepiej dla pacjenta onkologicznego."

### Odpowiedź naukowa
> Świeże warzywa i owoce są **wskazane** (≥500 g/dobę), **ale jeśli powodują dolegliwości** (wzdęcia, biegunkę), należy je **gotować** lub sporządzać z nich zupy, musy, soki przecierane, kisiele.
>
> Niektóre surowe owoce (śliwki, wiśnie, czereśnie, truskawki, kiwi) są **przeciwwskazane** w trakcie aktywnego leczenia.

### Konsekwencja dla modelu / aplikacji
- Forma podania (surowe vs. gotowane vs. mus) jest **funkcją objawów aktualnych**, a nie sztywnym wskazaniem.
- Przy biegunce — gotowane / pieczone; przy zaparciach — surowe / wilgotne.

---

## Mit 7 (rozpowszechniony, niewspomniany w dokumentach) — „Trzeba pić alkalizujące napary i unikać kwaśnego"

### Odpowiedź naukowa (poza dokumentami źródłowymi — wymaga walidacji dietetyka)
> pH organizmu jest precyzyjnie regulowane przez nerki i płuca. Dieta nie zmienia istotnie pH krwi. „Dieta alkaliczna" nie ma poparcia w badaniach onkologicznych. Niektóre kwaśne smaki (cytryna, ocet balsamiczny) są **zalecane** przy braku apetytu i zmianie smaku.

### Konsekwencja dla modelu / aplikacji
- **TODO:** ten punkt wymaga walidacji przez dietetyka klinicznego przed publikacją.
- Nie używamy „alkalizacji" jako argumentu marketingowego.

---

## Sumaryczna lista mitów do ekspozycji w aplikacji

```yaml
mity:
  - id: sok_z_buraka_hemoglobina
    krotki_opis: "Sok z buraka NIE podnosi hemoglobiny."
    pelna_odp: "Patrz wiedza/06-mity-zywieniowe.md, Mit 1"
  - id: zakaz_mleka
    krotki_opis: "Mleko nie jest zakazane — chyba że masz nietolerancję laktozy."
  - id: bialko_mieso_karmi_raka
    krotki_opis: "Białko jest pacjentowi onkologicznemu POTRZEBNE (1,2–2 g/kg)."
  - id: cukier_zywi_raka
    krotki_opis: "Glukoza jest paliwem WSZYSTKICH komórek — eliminacja węglowodanów szkodzi."
  - id: amigdalina_b17
    krotki_opis: "Pestki moreli — ryzyko zatrucia cyjankami. Nigdy nie stosować."
  - id: surowe_zawsze_zdrowe
    krotki_opis: "Surowe warzywa/owoce — tylko jeśli nie ma biegunki/wzdęć. Gotowane też są zdrowe."
```

To gotowy YAML do wstrzyknięcia w sekcję edukacyjną aplikacji.
