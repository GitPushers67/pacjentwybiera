"""
Konfiguracja aplikacji - Settings i zmienne środowiskowe.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongo_url: str = "mongodb://localhost:27017"
    chroma_host: str = "localhost"
    chroma_port: int = 8000
    cors_origins: list[str] = Field(default_factory=list)
    logmeal_api_key: str = ""
    # Endpoint Waste Detection z ilościami: /image/segmentation/complete?waste=true&quantity=true
    logmeal_url: str = "https://api.logmeal.es/v2/image/segmentation/complete"

    model_config = SettingsConfigDict(extra="ignore")

    @classmethod
    def parse_cors_origins(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


settings = Settings()
