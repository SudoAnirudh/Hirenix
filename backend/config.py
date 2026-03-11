from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"

    # GitHub
    github_token: Optional[str] = None

    # OpenAI
    openai_api_key: Optional[str] = None

    # Stripe
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None

    # App
    app_env: str = "development"
    allowed_origins: str = (
        "http://localhost:3000,http://localhost:3001,"
        "http://127.0.0.1:3000,http://127.0.0.1:3001,"
        "https://hirenix-h9ij1n4wf-anirudhs-projects-e6a6ef2f.vercel.app,"
        "https://hirenix-frontend-r4dsvvzeb-anirudhs-projects-e6a6ef2f.vercel.app"
    )
    allowed_origin_regex: Optional[str] = (
        r"https://.*\.vercel\.app|https://.*\.onrender\.com|https://.*\.netlify\.app"
    )

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
        extra = "ignore"

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]


settings = Settings()
