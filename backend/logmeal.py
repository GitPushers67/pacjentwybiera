import httpx
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Request
from pydantic import BaseModel
from config import settings
from meal_analysis import (
    parse_segmentation_response,
    calculate_consumed_by_differential_method,
    should_recommend_supplement,
    format_recommendation,
    MealTruth,
    NutrientInfo,
)
from meal_db import save_meal_report
from chroma_search import search_supplement_in_chroma


router = APIRouter(prefix="/api/logmeal", tags=["logmeal"])


@router.post("/analyze")
async def analyze_meal(
    image: UploadFile = File(...),
    class_constraints: str = Form(default="", description="Uproszczone składniki (class constraints dla LogMeal)"),
    calories_kcal: float = Form(..., description="Kalorie posiłku"),
    protein_grams: float = Form(..., description="Białko w gramach"),
    fat_grams: float = Form(..., description="Tłuszcz w gramach"),
    carbs_grams: float = Form(..., description="Węglowodany w gramach"),
    weight_grams: float = Form(..., description="Rzeczywista waga porcji z menu [g]"),
    reference_weight: float = Form(default=None, description="Waga referencyjna dla LogMeal"),
    reference_object: str = Form(default="false", description="Włącz detekcję przedmiotów referencyjnych"),
    request: Request = None,
) -> dict:
    """
    Analizuje zdjęcie posiłku za pomocą LogMeal API Waste Detection.
    
    Wykorzystuje endpoint: /image/segmentation/complete?waste=true&quantity=true
    LogMeal zwraca waste_percentage dla każdego składnika.
    
    Jednym calliem pobieramy:
    - Rozpoznanie składników
    - Ilości (quantity)
    - Procent odpadów (waste_percentage)
    
    **Parametry:**
    - image: Plik JPG/PNG z resztkami posiłku
    - dish_name: Nazwa dania z menu (np. "Dorsz na parze")
    - calories_kcal: Kalorie posiłku
    - protein_grams: Białko [g]
    - fat_grams: Tłuszcz [g]
    - carbs_grams: Węglowodany [g]
    - weight_grams: Standardowa waga porcji [g]
    - ingredients: Lista składników z API (komma-separated)
    - class_constraints: (opt) Podpowiedzi dla LogMeal
    
    **Zwraca:**
    ```json
    {
      "summary": "Zjadłeś ok. 60% posiłku.",
      "analysis": {
        "waste_percentage": 40,
        "missing_nutrients": {
          "kcal": 110,
          "protein": 6.5,
          "fat": 3.2,
          "carbohydrates": 12.1
        }
      },
      "recommendation": {
        "title": "Potrzebujesz doładowania!",
        "text": "Brakuje Ci 6.5g białka i 110 kcal. Sugerujemy uzupełnienie: OnkoShot.",
        "action_button": "Zamów OnkoShot",
        "missing_nutrients": {...}
      }
    }
    ```
    """
    
    if not settings.logmeal_api_key:
        raise HTTPException(status_code=500, detail="LogMeal API key not configured")
    
    if image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")
    
    # Przygotuj "prawdę o posiłku"
    # ✅ Krok 1: Rozbij ingredients na tagi (pojedyncze słowa)
    ingredient_list = [i.strip() for i in class_constraints.split(",") if i.strip()]
    
    # ✅ Krok 2: Konwertuj weight na float (handle przecinek)
    try:
        weight_float = float(weight_grams) if isinstance(weight_grams, (int, float)) else float(str(weight_grams).replace(",", "."))
    except (ValueError, TypeError):
        weight_float = weight_grams
    
    print(f"📌 Waga posiłku (konwertowana): {weight_grams} → {weight_float}")
    
    truth = MealTruth(
        dish_name="Posiłek z menu",
        ingredients=ingredient_list,
        nutrients=NutrientInfo(
            kcal=calories_kcal,
            protein=protein_grams,
            fat=fat_grams,
            carbohydrates=carbs_grams,
        ),
        weight_grams=weight_float,
    )
    
    # Odczytaj zawartość pliku
    image_data = await image.read()
    
    # ✅ Krok 3: Przygotuj multipart body dla LogMeal z pełnymi parametrami
    # Używamy /image/segmentation/complete z waste=true i quantity=true
    files = {"image": (image.filename, image_data, image.content_type)}
    data = {
        "waste": "true",
        "quantity": "true",
        "class_constraints": ",".join(ingredient_list[:10]),  # Max 10 słów kluczowych
        "target_weight": str(weight_float),  # Podpowiedź AI, ile powinna ważyć ta porcja
        "reference_object": "fork",  # Użyj widelca do skalowania
        "skip_confirmation": "true",  # Nie pytaj użytkownika, zlicz resztki
    }
    
    print(f"📤 Parametry dla LogMeal: {data}")
    
    # Wyślij do LogMeal /image/segmentation/complete
    logmeal_endpoint = "https://api.logmeal.es/v2/image/segmentation/complete"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                logmeal_endpoint,
                headers={"Authorization": f"Bearer {settings.logmeal_api_key}"},
                files=files,
                data=data,
                timeout=30.0
            )
            response.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="LogMeal API timeout")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"LogMeal API error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to analyze image: {str(e)}")
    
    logmeal_result = response.json()
    
    print(f"📥 Odpowiedź z LogMeal: {logmeal_result}")
    
    # Parsuj wynik LogMeal - teraz z estimated_weight
    segmentation_items = parse_segmentation_response(logmeal_result)
    
    # Oblicz procent zjedzony używając METODY RÓŻNICOWEJ
    consumed_percent, missing_nutrients = calculate_consumed_by_differential_method(truth, segmentation_items)
    
    # ✅ Krok 4: FALLBACK LOGIC - jeśli LogMeal nie rozpoznał (100% waste = 0% consumed)
    if consumed_percent <= 5:  # <= 5% means LogMeal couldn't detect anything
        print(f"⚠️ LogMeal nie rozpoznał resztek (consumed: {consumed_percent}%). Zwracam fallback.")
        return {
            "error": "unrecognized_image",
            "message": "Zdjęcie jest nieczytelne lub brak widocznych resztek. Określ ręcznie ile procent zjadłeś posiłku.",
            "fallback_mode": True,
            "original_meal_weight": weight_float,
            "calories": calories_kcal,
            "_debug": {
                "logmeal_raw": logmeal_result,
                "segmentation_items": [
                    {"food": item.food_item, "estimated_weight": item.estimated_weight}
                    for item in segmentation_items
                ]
            }
        }
    
    # Czy rekomendować suplementację?
    should_supplement = should_recommend_supplement(missing_nutrients)
    recommendation = None
    
    if should_supplement:
        recommendation = format_recommendation(missing_nutrients)
        
        # Wyszukaj produkt w ChromaDB (opcjonalnie)
        try:
            chroma_client = request.app.state.chroma_client
            supplement_info = await search_supplement_in_chroma(chroma_client)
            if supplement_info:
                recommendation["supplement_product"] = supplement_info
        except Exception as e:
            print(f"Warning: ChromaDB search failed: {e}")
    
    # Przygotuj wynik do zwrócenia i zapisania
    analysis_result = {
        "consumed_percent": round(consumed_percent, 1),
        "missing_nutrients": missing_nutrients,
    }
    
    response_payload = {
        "summary": f"Zjadłeś ok. {consumed_percent:.0f}% posiłku.",
        "analysis": analysis_result,
        "recommendation": recommendation,
        "_debug": {
            "logmeal_raw": logmeal_result,
            "segmentation_items": [
                {"food": item.food_item, "estimated_weight": item.estimated_weight}
                for item in segmentation_items
            ]
        }
    }
    
    # Spróbuj zapisać do MongoDB (opcjonalnie, bez blokowania odpowiedzi)
    try:
        db = request.app.state.mongo_client["pacjentwybiera"]
        user_id = "unknown"  # TODO: pobierz z JWT/session
        
        await save_meal_report(
            db=db,
            user_id=user_id,
            original_meal="Posiłek z menu",
            analysis_result=analysis_result,
            summary=response_payload["summary"],
            eaten_percentage=consumed_percent,
            recommendation_given=should_supplement,
        )
    except Exception as e:
        print(f"Warning: Failed to save meal report: {e}")
    
    return response_payload


@router.get("/health")
async def health_check():
    """Sprawdza dostępność i konfigurację LogMeal API"""
    return {
        "status": "ok" if settings.logmeal_api_key else "not_configured",
        "logmeal_url": settings.logmeal_url,
        "api_key_set": bool(settings.logmeal_api_key)
    }
