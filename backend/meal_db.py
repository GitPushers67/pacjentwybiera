"""
Moduł do interakcji z MongoDB.
Przechowuje raporty analizy posiłków dla historii pacjenta.
"""

from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel


class MealReportDB(BaseModel):
    """Model dokumentu do MongoDB"""
    user_id: str
    timestamp: datetime
    original_meal: str  # dish_name
    analysis_result: dict  # Pełny JSON z analizy (analiza + logmeal raw)
    summary: str
    eaten_percentage: float
    recommendation_given: bool


async def save_meal_report(
    db: AsyncIOMotorDatabase,
    user_id: str,
    original_meal: str,
    analysis_result: dict,
    summary: str,
    eaten_percentage: float,
    recommendation_given: bool,
) -> str:
    """
    Zapisuje raport analizy do kolekcji 'meal_reports'.
    
    Zwraca: ID dokumentu w MongoDB
    """
    
    collection = db["meal_reports"]
    
    report = {
        "user_id": user_id,
        "timestamp": datetime.utcnow(),
        "original_meal": original_meal,
        "analysis_result": analysis_result,
        "summary": summary,
        "eaten_percentage": eaten_percentage,
        "recommendation_given": recommendation_given,
    }
    
    result = await collection.insert_one(report)
    return str(result.inserted_id)


async def get_meal_reports(
    db: AsyncIOMotorDatabase,
    user_id: str,
    limit: int = 10,
) -> list[dict]:
    """
    Pobiera ostatnie raporty analizy dla pacjenta.
    """
    
    collection = db["meal_reports"]
    
    reports = await collection.find(
        {"user_id": user_id}
    ).sort("timestamp", -1).limit(limit).to_list(length=limit)
    
    return reports
