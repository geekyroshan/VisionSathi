"""
VisionSathi API - Health Router

Health check endpoints for monitoring.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

from config import settings
from services.moondream import get_moondream

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    timestamp: str
    version: str
    model_loaded: bool
    model_name: str
    ollama_url: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.

    Returns service status and model availability.
    """
    moondream = get_moondream()
    model_loaded = await moondream.is_loaded()

    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
        model_loaded=model_loaded,
        model_name=settings.ollama_model,
        ollama_url=settings.ollama_url,
    )


@router.get("/ready")
async def readiness_check():
    """
    Readiness check for Kubernetes/container orchestration.

    Returns 200 only when Ollama is reachable and the model is available.
    """
    moondream = get_moondream()
    model_ready = await moondream.is_loaded()

    if not model_ready:
        return {
            "ready": False,
            "reason": f"Ollama model '{settings.ollama_model}' not available. "
                      f"Run: ollama pull {settings.ollama_model}",
        }

    return {"ready": True}
