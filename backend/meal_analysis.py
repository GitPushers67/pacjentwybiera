"""
Moduł do logiki analizy resztek posiłku (Waste Detection).
Porównuje zdjęcie (rezultat LogMeal) z "prawdą o posiłku" z bazy danych.

LogMeal /image/segmentation/complete endpoint zwraca estimated_weight dla każdego składnika.
Używamy METODY RÓŻNICOWEJ:
  Zjedzona Masa = weight_grams (z menu) - estimated_weight (z LogMeal)
  Procent = (Zjedzona Masa / weight_grams) * 100
"""

from pydantic import BaseModel


class NutrientInfo(BaseModel):
    """Informacja o makroskładnikach"""
    kcal: float
    protein: float  # gramy
    fat: float
    carbohydrates: float


class MealTruth(BaseModel):
    """'Prawda o posiłku' - co powinno być na talerzu"""
    dish_name: str
    ingredients: list[str]  # lista składników z API
    nutrients: NutrientInfo
    weight_grams: float


class SegmentationItem(BaseModel):
    """Jeden segment z LogMeal /image/segmentation/complete"""
    food_item: str
    estimated_weight: float | None = None
    quantity: dict | None = None


def parse_segmentation_response(logmeal_json: dict) -> list[SegmentationItem]:
    """
    Parsuje odpowiedź z LogMeal /image/segmentation/complete.
    
    Oczekiwany format:
    {
        "segmentation_results": [
            {
                "food_item": "muffins",
                "estimated_weight": 150,
                "quantity": {"value": 150, "unit": "g"},
                ...
            },
            ...
        ]
    }
    """
    items = []
    
    # Spróbuj różne możliwe klucze w odpowiedzi
    segmentation = logmeal_json.get("segmentation_results") or logmeal_json.get("segmentation") or []
    
    for item in segmentation:
        food_name = item.get("food_item", "unknown")
        estimated_weight = item.get("estimated_weight")
        
        # Jeśli nie ma estimated_weight, spróbuj wyciągnąć z quantity
        if estimated_weight is None:
            quantity = item.get("quantity", {})
            if isinstance(quantity, dict) and quantity.get("unit") == "g":
                estimated_weight = float(quantity.get("value", 0))
        
        seg_item = SegmentationItem(
            food_item=food_name,
            estimated_weight=estimated_weight,
            quantity=item.get("quantity")
        )
        items.append(seg_item)
    
    return items


def calculate_consumed_by_differential_method(
    truth: MealTruth,
    segmentation_items: list[SegmentationItem]
) -> tuple[float, dict]:
    """
    Oblicza zjedzoną masę i makroskładniki używając METODY RÓŻNICOWEJ.
    
    Logika:
    1. Suma wszystkich estimated_weight z LogMeal = Masa pozostała na talerzu
    2. Zjedzona Masa = weight_grams (z menu) - Masa pozostała
    3. Procent = (Zjedzona Masa / weight_grams) * 100
    4. Brakujące = Procent × Wartości bazowe
    
    Zwraca:
    - Procent zjedzony (0-100)
    - Słownik brakujących makroskładników
    """
    
    if not segmentation_items or all(item.estimated_weight is None for item in segmentation_items):
        # Jeśli nic nie rozpoznano, assume całość pozostała
        print("⚠️ LogMeal nie rozpoznał pozostałości. Zakładam 100% waste_percentage.")
        return 0.0, {
            "kcal": truth.nutrients.kcal,
            "protein": truth.nutrients.protein,
            "fat": truth.nutrients.fat,
            "carbohydrates": truth.nutrients.carbohydrates,
        }
    
    # Suma wszystkich rozpoznanych mas na talerzu
    leftover_mass = sum(
        item.estimated_weight for item in segmentation_items 
        if item.estimated_weight is not None
    )
    
    # Zjedzona masa
    consumed_mass = truth.weight_grams - leftover_mass
    
    # Procent zjedzony
    if truth.weight_grams > 0:
        consumed_percent = (consumed_mass / truth.weight_grams) * 100
    else:
        consumed_percent = 0.0
    
    # Ograniczenie: 0-100%
    consumed_percent = max(0, min(100, consumed_percent))
    
    # Brakujące makroskładniki = co NIE zostało zjedzane
    # Jeśli zjedzono 60%, to brakuje 40%
    leftover_percent = 100 - consumed_percent
    leftover_ratio = leftover_percent / 100
    
    missing = {
        "kcal": round(truth.nutrients.kcal * leftover_ratio, 1),
        "protein": round(truth.nutrients.protein * leftover_ratio, 1),
        "fat": round(truth.nutrients.fat * leftover_ratio, 1),
        "carbohydrates": round(truth.nutrients.carbohydrates * leftover_ratio, 1),
    }
    
    print(f"📊 Metoda Różnicowa:")
    print(f"  Waga menu: {truth.weight_grams}g")
    print(f"  Waga resztek (LogMeal): {leftover_mass}g")
    print(f"  Zjedzona masa: {consumed_mass}g")
    print(f"  Procent zjedzony: {consumed_percent:.1f}%")
    print(f"  Brakujące makroskładniki: {missing}")
    
    return consumed_percent, missing


def should_recommend_supplement(missing: dict) -> bool:
    """
    Decyduje czy wyzwolić rekomendację suplementacji.
    
    Progi wyzwolenia:
    - Białko > 5g LUB
    - Kalorie > 100 kcal
    """
    
    if missing.get("protein", 0) > 5.0 or missing.get("kcal", 0) > 100.0:
        return True
    
    return False


def format_recommendation(missing: dict, supplement_name: str = "OnkoShot") -> dict:
    """Formatuje rekomendację suplementacji dla frontendu"""
    
    return {
        "title": "Potrzebujesz doładowania!",
        "text": f"Brakuje Ci {missing['protein']:.1f}g białka i {missing['kcal']:.0f} kcal. "
                f"Sugerujemy uzupełnienie: {supplement_name}.",
        "action_button": f"Zamów {supplement_name}",
        "missing_nutrients": missing,
    }


