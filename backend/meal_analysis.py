"""
Moduł do logiki analizy resztek posiłku.
Porównuje zdjęcie (rezultat LogMeal) z "prawdą o posiłku" z bazy danych.
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
    ingredients: list[str]  # lista składników
    nutrients: NutrientInfo
    weight_grams: float


class LogMealDetection(BaseModel):
    """Jeden wykryty obiekt z LogMeal API"""
    food_item: str  # nazwa składnika/dania
    volume_ml: float | None = None  # objętość w ml
    weight_grams: float | None = None  # waga w g
    confidence: float = 1.0  # pewność rozpoznania (0-1)


class LeftoverAnalysis(BaseModel):
    """Wynik analizy - co zostało, co brakuje"""
    leftover_percentage: float  # % zjadanego posiłku (0-100)
    missing_nutrients: NutrientInfo
    detected_items: list[str]  # co LogMeal widzi na zdjęciu
    recommendation: dict | None = None


def parse_logmeal_response(logmeal_json: dict) -> list[LogMealDetection]:
    """
    Parsuje odpowiedź z LogMeal API.
    
    Oczekiwany format (na podstawie dokumentacji LogMeal):
    {
        "nutrition_info": [
            {
                "food_item": "salmon",
                "quantity": {"value": 150, "unit": "g"},
                ...
            },
            ...
        ]
    }
    """
    detections = []
    
    nutrition_info = logmeal_json.get("nutrition_info", [])
    
    for item in nutrition_info:
        food_name = item.get("food_item", "unknown")
        
        # Spróbuj wyodrębnić wagę
        quantity = item.get("quantity", {})
        weight = None
        
        if quantity.get("unit") == "g":
            weight = float(quantity.get("value", 0))
        elif quantity.get("unit") == "ml":
            # Assume 1ml ≈ 1g as approximation
            weight = float(quantity.get("value", 0))
        
        confidence = item.get("confidence", 1.0)
        
        detection = LogMealDetection(
            food_item=food_name,
            weight_grams=weight,
            confidence=confidence
        )
        detections.append(detection)
    
    return detections


def calculate_leftover_percentage(
    truth: MealTruth,
    detections: list[LogMealDetection]
) -> tuple[float, list[str]]:
    """
    Porównuje co LogMeal widzi z "prawdą o posiłku".
    
    Zwraca:
    - Procent pozostałości (0 = zjedzono wszystko, 100 = nic nie zjedzono)
    - Listę wykrytych składników
    """
    
    if not detections:
        # Jeśli nic nie widać na zdjęciu, assume całość pozostała
        return 100.0, []
    
    detected_foods = [d.food_item.lower() for d in detections]
    truth_ingredients = [ing.lower() for ing in truth.ingredients]
    
    # Matchuj składniki (fuzzy matching: czy substring zawiera się)
    matched_count = 0
    for detected in detected_foods:
        for ingredient in truth_ingredients:
            if detected in ingredient or ingredient in detected:
                matched_count += 1
                break
    
    if not truth.ingredients:
        match_ratio = 0.5  # fallback
    else:
        match_ratio = matched_count / len(truth.ingredients)
    
    # Procent pozostałości ≈ inverse match ratio
    leftover_percentage = (1 - match_ratio) * 100
    
    return leftover_percentage, detected_foods


def calculate_missing_nutrients(
    truth: MealTruth,
    leftover_percentage: float
) -> NutrientInfo:
    """
    Oblicza brakujące makroskładniki na podstawie % pozostałości.
    
    Jeśli leftover_percentage = 60, to 40% zjedzono, 60% zostało.
    Brakujące = 40% × nutrients_truth
    """
    
    # Procent zjedzony
    eaten_percentage = 100 - leftover_percentage
    eaten_ratio = eaten_percentage / 100
    
    # Brakujące to to co NIE zostało zjedzane
    missing = NutrientInfo(
        kcal=truth.nutrients.kcal * eaten_ratio,
        protein=truth.nutrients.protein * eaten_ratio,
        fat=truth.nutrients.fat * eaten_ratio,
        carbohydrates=truth.nutrients.carbohydrates * eaten_ratio,
    )
    
    return missing


def should_recommend_supplement(missing: NutrientInfo) -> bool:
    """
    Decyduje czy wyzwolić rekomendację suplementacji.
    
    Progi wyzwolenia (plan.md):
    - Białko > 5g LUB
    - Kalorie > 100 kcal
    """
    
    if missing.protein > 5.0 or missing.kcal > 100.0:
        return True
    
    return False


def format_recommendation(missing: NutrientInfo, supplement_name: str = "OnkoShot") -> dict:
    """Formatuje rekomendację suplementacji dla frontendu"""
    
    return {
        "title": "Potrzebujesz doładowania!",
        "text": f"Brakuje Ci {missing.protein:.1f}g białka i {missing.kcal:.0f} kcal. "
                f"Proponujemy wypicie dodatkowego {supplement_name}u (smak neutralny), "
                f"aby uzupełnić niedobory.",
        "action_button": f"Zamów {supplement_name}",
        "missing_nutrients": {
            "kcal": round(missing.kcal, 1),
            "protein": round(missing.protein, 1),
        },
    }
