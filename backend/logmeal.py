import httpx
from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Request
from pydantic import BaseModel
from main import settings
from meal_analysis import (
    parse_logmeal_response,
    calculate_leftover_percentage,
    calculate_missing_nutrients,
    should_recommend_supplement,
    format_recommendation,
    MealTruth,
    NutrientInfo,
    LeftoverAnalysis,
)
from meal_db import save_meal_report
from chroma_search import search_supplement_in_chroma


router = APIRouter(prefix="/api/logmeal", tags=["logmeal"])


@router.post("/analyze")
async def analyze_meal(
    image: UploadFile = File(...),
    dish_name: str = Query(..., description="Nazwa dania z menu"),
    calories_kcal: float = Query(..., description="Kalorie posiłku (format: liczba z pkt)"),
    protein_grams: float = Query(..., description="Białko w gramach"),
    fat_grams: float = Query(..., description="Tłuszcz w gramach"),
    carbs_grams: float = Query(..., description="Węglowodany w gramach"),
    weight_grams: float = Query(default=300, description="Standardowa waga porcji [g]"),
    ingredients: str = Query(default="", description="Składniki oddzielone przecinkami"),
    class_constraints: list[str] | None = None,
) -> dict:
    """
    Analizuje zdjęcie posiłku za pomocą LogMeal API.
    Porównuje resztki z "prawdą o posiłku" i rekomenduje suplementację jeśli potrzeba.
    
    **Parametry:**
    - image: Plik JPG/PNG z resztkami posiłku
    - dish_name: Nazwa dania (np. "Dorsz na parze")
    - calories_kcal: Kalorie dania
    - protein_grams: Białko [g]
    - fat_grams: Tłuszcz [g]
    - carbs_grams: Węglowodany [g]
    - weight_grams: Standardowa waga porcji
    - ingredients: Lista składników (komma-separated)
    - class_constraints: (opt) Podpowiedzi dla LogMeal
    
    **Zwraca:**
    ```json
    {
      "summary": "Zjadłeś ok. 60% posiłku.",
      "analysis": {
        "leftover_detected": ["placuszki", "łosoś"],
        "leftover_percentage": 40,
        "missing_nutrients": {"kcal": 110, "protein": 6.5, ...}
      },
      "recommendation": {
        "title": "Potrzebujesz doładowania!",
        "text": "...",
        "action_button": "Zamów OnkoShot"
      }
    }
    ```
    """
    
    if not settings.logmeal_api_key:
        raise HTTPException(status_code=500, detail="LogMeal API key not configured")
    
    if image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPEG and PNG images are supported")
    
    # Przygotuj "prawdę o posiłku"
    ingredient_list = [i.strip() for i in ingredients.split(",") if i.strip()]
    
    truth = MealTruth(
        dish_name=dish_name,
        ingredients=ingredient_list,
        nutrients=NutrientInfo(
            kcal=calories_kcal,
            protein=protein_grams,
            fat=fat_grams,
            carbohydrates=carbs_grams,
        ),
        weight_grams=weight_grams,
    )
    
    # Odczytaj zawartość pliku
    image_data = await image.read()
    
    # Przygotuj multipart body dla LogMeal
    files = {"image": (image.filename, image_data, image.content_type)}
    data = {}
    
    if class_constraints:
        data["class_constraints"] = class_constraints
    else:
        # Automatyczne podpowiedzi z naszych składników
        data["class_constraints"] = ingredient_list[:10]  # Limit to 10
    
    # Wyślij do LogMeal
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.logmeal_url,
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
    
    # Parsuj wynik LogMeal
    detections = parse_logmeal_response(logmeal_result)
    
    # Oblicz procent pozostałości
    leftover_pct, detected_items = calculate_leftover_percentage(truth, detections)
    
    # Oblicz brakujące makroskładniki
    missing_nutrients = calculate_missing_nutrients(truth, leftover_pct)
    
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
    
    # Oblicz procent zjedzenia (do wyświetlenia)
    eaten_percentage = 100 - leftover_pct
    
    # Przygotuj wynik do zwrócenia i zapisania
    analysis_result = {
        "leftover_detected": detected_items,
        "leftover_percentage": round(leftover_pct, 1),
        "missing_nutrients": {
            "kcal": round(missing_nutrients.kcal, 1),
            "protein": round(missing_nutrients.protein, 1),
            "fat": round(missing_nutrients.fat, 1),
            "carbohydrates": round(missing_nutrients.carbohydrates, 1),
        }
    }
    
    response_payload = {
        "summary": f"Zjadłeś ok. {eaten_percentage:.0f}% posiłku.",
        "analysis": analysis_result,
        "recommendation": recommendation,
        "_debug": {
            "logmeal_raw": logmeal_result,  # Debug: raw response
        }
    }
    
    # Spróbuj zapisać do MongoDB (opcjonalnie, bez blokowania odpowiedzi)
    try:
        db = request.app.state.mongo_client["pacjentwybiera"]
        user_id = "unknown"  # TODO: pobierz z JWT/session
        
        await save_meal_report(
            db=db,
            user_id=user_id,
            original_meal=dish_name,
            analysis_result=analysis_result,
            summary=response_payload["summary"],
            eaten_percentage=eaten_percentage,
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
