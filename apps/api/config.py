"""
VisionSathi API - Configuration

Environment-based configuration using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""

    # API settings
    api_title: str = "VisionSathi API"
    api_version: str = "1.0.0"
    debug: bool = False

    # CORS - allow all origins for dev (mobile + local network)
    cors_origins: List[str] = ["*"]

    # Production API URL (for reference in logs)
    api_base_url: str = "http://localhost:8000"

    # Ollama settings
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "moondream"

    # Cache settings
    cache_enabled: bool = True
    cache_ttl: int = 3600  # 1 hour

    # Rate limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
