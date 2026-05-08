# pacjentwybiera Backend API

## GET /

**Description:** Health check endpoint for the backend service.

**Response 200**
```json
{
  "status": "ok"
}
```

---

## GET /wp-json/mobilnycatering/v1/menu-schedules

**Base URL:** `https://pacjentwybiera.pl`

Zwraca menu na wskazany dzień dla konkretnego pacjenta i wariantu diety.

**Query parameters:**

| Parametr | Przykład | Opis |
|----------|----------|------|
| `dietId` | `2388` | ID diety pacjenta |
| `dietVariantId` | `4881` | ID wariantu diety |
| `dietVariantCaloriesId` | `18414` | ID poziomu kaloryczności |
| `menuScheduleId` | `7354` | ID harmonogramu menu |
| `menuDateAsString` | `2026-05-15` | Data menu (format `YYYY-MM-DD`) |

**Response 200:**

```json
{
  "content": [MealSlot, ...]
}
```

### MealSlot

| Pole | Typ | Opis |
|------|-----|------|
| `mealName` | `string` | Nazwa posiłku |
| `sortOrder` | `number` | Kolejność (0–6) |
| `dishes` | `Dish[]` | Lista dań do wyboru — zawsze 2 |
| `mandatory` | `boolean` | Czy posiłek obowiązkowy (zawsze `true`) |
| `minDishesCount` | `number` | Min. liczba wybieranych dań (zawsze `1`) |
| `maxDishesCount` | `number` | Max. liczba wybieranych dań (zawsze `1`) |
| `selectedByDefault` | `boolean` | Czy zaznaczony domyślnie |
| `showIngredientsAndAllergensInMenu` | `string` | `"ALLERGENS_AND_INGREDIENTS"` |

**Mapowanie `sortOrder` → posiłek:**

| sortOrder | mealName |
|-----------|----------|
| 0 | Śniadanie |
| 1 | II Śniadanie |
| 2 | Obiad |
| 3 | Podwieczorek |
| 4 | Kolacja |
| 5 | Koktajl |
| 6 | OnkoShot |

### Dish

| Pole | Typ | Opis |
|------|-----|------|
| `dishName` | `string` | Pełna nazwa dania |
| `ingredientsName` | `string` | Składniki; alergeny owinięte w `<b><u>...</u></b>` |
| `allergens` | `string` | Lista alergenów oddzielona przecinkami |
| `calories_kcal` | `string` | Kalorie w formacie polskim, np. `"341,3"` |
| `protein` | `string` | Białko [g], format PL |
| `fat` | `string` | Tłuszcz [g], format PL |
| `carbohydrates` | `string` | Węglowodany [g], format PL |
| `fiber` | `string` | Błonnik [g], format PL |
| `weight` | `string` | Waga porcji [g], format PL |
| `weightOunces` | `string` | Waga porcji [oz] |
| `photo` | `string` | URL zdjęcia (aktualnie zawsze `""`) |
| `glutenFree` | `boolean` | Bez glutenu |
| `dairyFree` | `boolean` | Bez nabiału |
| `lactoseFree` | `boolean` | Bez laktozy |
| `vegetarian` | `boolean` | Wegetariańskie |
| `vegan` | `boolean` | Wegańskie |
| `fish` | `boolean` | Zawiera ryby |
| `meat` | `boolean` | Zawiera mięso |
| `sweet` | `boolean` | Słodkie |
| `spicy` | `boolean` | Pikantne |
| `eatHot` | `boolean` | Serwować na ciepło |
| `eatCold` | `boolean` | Serwować na zimno |
| `highProtein` | `boolean` | Wysokobiałkowe |
| `easilyDigestible` | `boolean` | Lekkostrawne |
| `forKids` | `boolean` | Dla dzieci |
| `noSalt` | `boolean` | Bez soli |
| `lowGi` | `boolean` | Niski indeks glikemiczny |
| `keto` | `boolean` | Keto |
| `bestseller` | `boolean` | Bestseller |
| `chefsSpecial` | `boolean` | Specjalność szefa |
| `description` | `string \| null` | Opis (aktualnie zawsze `null`) |

**Uwagi implementacyjne:**
- Liczby dziesiętne używają przecinka (`"341,3"`) — parsuj przez `.replace(',', '.')`
- `ingredientsName` zawiera HTML — stripuj `<b>`, `</b>`, `<u>`, `</u>` przed wyświetleniem
- Wszystkie flagi dietetyczne (`highProtein`, `easilyDigestible`, etc.) są `false` w obecnym menu onkologicznym
- Pierwsze danie (`dishes[0]`) traktowane jest jako opcja rekomendowana
