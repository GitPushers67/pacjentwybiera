import json
from contextlib import asynccontextmanager

import chromadb
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from openai import AsyncOpenAI


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    cors_origins: list[str] = Field(default_factory=list)
    groq_api_key: str = ""

    model_config = SettingsConfigDict(extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

settings = Settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mongo_client = AsyncIOMotorClient(settings.mongo_url)
    app.state.chroma_client = chromadb.HttpClient(
        host=settings.chroma_host,
        port=settings.chroma_port,
    )
    yield
    app.state.mongo_client.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok"}


class RecommendRequest(BaseModel):
    patient: dict
    symptoms: list[str]
    symptomHistory: list[dict]
    eatenMap: dict
    activeMeals: list[dict]

@app.post("/api/recommend")
async def recommend_meals(req: RecommendRequest):
    if not settings.groq_api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")

    client = AsyncOpenAI(
        api_key=settings.groq_api_key,
        base_url="https://api.groq.com/openai/v1"
    )

    prompt = f"""
Jesteś ekspertem dietetyki klinicznej wspierającym pacjentów onkologicznych.
Zadanie: Wybierz najlepsze dania dla pacjenta na pojutrze, z dostępnych opcji dla poszczególnych posiłków.

Dane pacjenta:
{json.dumps(req.patient, ensure_ascii=False, indent=2)}

Dzisiejsze objawy:
{json.dumps(req.symptoms, ensure_ascii=False, indent=2)}

Historia objawów:
{json.dumps(req.symptomHistory, ensure_ascii=False, indent=2)}

Spożycie posiłków dzisiaj (full = zjedzone, none = niezjedzone):
{json.dumps(req.eatenMap, ensure_ascii=False, indent=2)}

Dostępne posiłki do wyboru na pojutrze:
{json.dumps(req.activeMeals, ensure_ascii=False, indent=2)}

Zasady i wytyczne:
1. NIEZALEŻNOŚĆ OCENY: Zignoruj całkowicie pola `isRec`, `score` oraz `scoreReason` w opcjach - to są sztywne wartości systemowe, które masz zignorować. Zrób w 100% samodzielną, obiektywną ocenę na podstawie prawdziwych składników (ingredientsName), makroskładników (szczególnie białka) oraz aktualnych objawów pacjenta! 
2. DOPASOWANIE DO OBJAWÓW (KLINICZNE):
   - Nudności/wymioty: preferuj dania na zimno, łagodne, bez intensywnych zapachów, unikaj bardzo tłustych.
   - Biegunka: preferuj dania zapierające (np. ryż, marchew), unikaj nadmiaru błonnika.
   - Zaparcia: preferuj opcje z większą ilością warzyw i owoców.
   - Brak apetytu: preferuj posiłki gęste odżywczo, wysokobiałkowe.
   - Zmiany w jamie ustnej: unikaj dań kwaśnych, gorących i suchych/twardych.
3. PERSONALIZACJA: W uzasadnieniach (reason) zwracaj się empatycznie bezpośrednio do pacjenta na "Ty" (używając jego imienia z profilu). Wyjaśnij konkretnie, dlaczego dany składnik pomoże mu w jego aktualnym samopoczuciu lub leczeniu.
4. ODWAŻNE DECYZJE: Bądź rzetelny i nie bój się wybierać alternatywy (opcja 1), jeśli lepiej pasuje do dzisiejszych objawów pacjenta niż domyślna rekomendacja (opcja 0).
5. UZASADNIENIE OGÓLNE (globalReason): Podsumuj w 2-3 zdaniach całą strategię na dzień. Daj pacjentowi poczucie zaopiekowania i wyjaśnij główny cel dzisiejszej diety.
6. Zwróć DOKŁADNIE w formacie JSON (nic więcej):
{{
  "globalReason": "krótkie ogólne uzasadnienie decyzji na cały dzień",
  "choices": {{
    "breakfast": {{"choice": 0, "reason": "uzasadnienie dla śniadania"}},
    "lunch2": {{"choice": 1, "reason": "uzasadnienie dla II śniadania"}},
    ... pozostałe opcje
  }}
}}
Pamiętaj o dopasowaniu kluczy w `choices` do odpowiednich id posiłków.
    """

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Jesteś asystentem zwracającym odpowiedzi tylko w formacie JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")

    result_text = response.choices[0].message.content
    try:
        data = json.loads(result_text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
