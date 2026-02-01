"""
VisionSathi API - Health Router

Health check endpoints for monitoring.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    timestamp: str
    version: str
    model_loaded: bool
    model_name: str


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.

    Returns service status and model availability.
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        version="1.0.0",
        model_loaded=True,  # TODO: Check actual model state
        model_name="moondream-3-2b",
    )


@router.get("/ready")
async def readiness_check():
    """
    Readiness check for Kubernetes/container orchestration.

    Returns 200 only when model is fully loaded and ready.
    """
    # TODO: Check if model is actually ready
    model_ready = True

    if not model_ready:
        return {"ready": False, "reason": "Model not loaded"}

    return {"ready": True}
