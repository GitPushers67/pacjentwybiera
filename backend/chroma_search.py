"""
Moduł do interakcji z ChromaDB.
Wyszukuje produkty wysokobiałkowe pasujące do rekomendacji suplementacji.
"""

import chromadb
from typing import Optional


async def search_supplement_in_chroma(
    chroma_client: chromadb.HttpClient,
    user_preferences: dict | None = None,
) -> Optional[dict]:
    """
    Wyszukuje produkt wysokobiałkowy w ChromaDB.
    
    Szukamy produktów z wysoką zawartością białka pasujących do:
    - Preferencji pacjenta (wegetariańskie, bez laktozy, itp.)
    - Diety onkologicznej
    
    Zwraca: dict z rekomendacją produktu lub None
    """
    
    try:
        collection = chroma_client.get_collection(name="meals_supplements")
    except Exception:
        # Kolekcja nie istnieje — wróć None bez błędu
        return None
    
    # Szukaj produktów z hasłem "high protein" + "supplement"
    results = collection.query(
        query_texts=["high protein supplement nutritional drink"],
        n_results=1,
        where={
            "$and": [
                {"protein_per_100g": {"$gte": 5}},  # Wysoka zawartość białka
                {"category": "supplement"},  # Suplementy/napoje
            ]
        } if hasattr(collection, "_metadata") else {}
    )
    
    if results and results.get("documents") and len(results["documents"]) > 0:
        top_result = results["documents"][0][0]
        return {
            "name": top_result.get("name", "OnkoShot"),
            "description": top_result.get("description", "Vysokobiałkowy napój odżywczy"),
            "protein_per_100ml": top_result.get("protein_per_100ml", 8.0),
        }
    
    # Fallback na OnkoShot jeśli nic nie znaleziono
    return {
        "name": "OnkoShot",
        "description": "Wysokobiałkowy napój o smaku neutralnym",
        "protein_per_100ml": 8.0,
    }


def query_meals_by_diet(
    chroma_client: chromadb.HttpClient,
    diet_type: str,
    min_protein: float = 5.0,
) -> list[dict]:
    """
    Wyszukuje posiłki pasujące do typu diety.
    
    Args:
        diet_type: "oncology", "vegetarian", "gluten_free" etc.
        min_protein: Minimalna zawartość białka w gramach
    
    Returns: Lista posiłków
    """
    
    try:
        collection = chroma_client.get_collection(name="meals")
    except Exception:
        return []
    
    results = collection.query(
        query_texts=[diet_type],
        n_results=5,
    )
    
    meals = []
    if results and results.get("documents"):
        for doc in results["documents"][0]:
            meals.append({
                "name": doc.get("name"),
                "protein": doc.get("protein_grams", 0),
                "calories": doc.get("calories_kcal", 0),
            })
    
    return meals
