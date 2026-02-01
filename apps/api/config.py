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

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8081",
        "http://localhost:19006",
        "exp://localhost:8081",
    ]

    # Model settings
    moondream_model: str = "vikhyatk/moondream2"
    moondream_device: str = "mps"  # "cuda", "mps" (Apple Silicon), or "cpu"
    moondream_dtype: str = "float32"  # float16 not well supported on MPS/CPU

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
