"""
VisionSathi API - Analyze Router

Single-shot image analysis with Moondream → OpenAI fallback.
"""

import time
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from services.moondream import get_moondream
from services.openai_service import get_openai
from prompts.describe import get_prompt_for_mode
from prompts.personality import get_sathi_prompt

logger = logging.getLogger(__name__)
router = APIRouter()


class AnalyzeRequest(BaseModel):
    """Request model for image analysis."""

    image: str  # base64 encoded
    mode: str = "describe"  # describe, read, navigate
    verbosity: str = "normal"  # brief, normal, detailed
    language: str = "en"


class AnalyzeResponse(BaseModel):
    """Response model for image analysis."""

    id: str
    description: str
    confidence: float
    processingMs: int
    detectedObjects: Optional[List[str]] = None
    source: str = "cloud"


@router.post("", response_model=AnalyzeResponse)
async def analyze_image(request: AnalyzeRequest):
    """
    Analyze an image and return description.

    Tries Moondream via Ollama first, falls back to OpenAI GPT-4o.
    """
    start_time = time.time()

    try:
        image_base64 = _decode_image(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    prompt = get_prompt_for_mode(request.mode, request.verbosity)
    source = "local"
    description = ""
    confidence = 0.0
    processing_ms = 0

    # Try Moondream first
    moondream = get_moondream()
    try:
        if await moondream.is_loaded():
            description, confidence, processing_ms = await moondream.analyze(
                image_base64, prompt
            )
        else:
            raise RuntimeError("Moondream not loaded")
    except Exception as e:
        logger.info(f"Moondream unavailable ({e}), trying OpenAI fallback...")

        # Fallback to OpenAI
        openai_svc = get_openai()
        if not openai_svc.is_available():
            raise HTTPException(
                status_code=503,
                detail="I'm having trouble seeing right now. Neither Moondream nor OpenAI is available.",
            )

        try:
            sathi_prompt = get_sathi_prompt(request.mode, request.verbosity)
            description, confidence, processing_ms = await openai_svc.analyze(
                image_base64,
                system_prompt=sathi_prompt,
                user_prompt=prompt,
            )
            source = "cloud"
        except Exception as fallback_error:
            raise HTTPException(
                status_code=500,
                detail=f"Both Moondream and OpenAI failed. Last error: {fallback_error}",
            )

    # Extract detected objects (simple heuristic)
    words = description.lower().split()
    common_objects = [
        "door",
        "window",
        "chair",
        "table",
        "person",
        "car",
        "tree",
        "sign",
        "light",
        "stairs",
        "wall",
        "floor",
        "ceiling",
        "road",
        "sidewalk",
        "building",
        "phone",
        "book",
        "cup",
        "bottle",
    ]
    detected = [obj for obj in common_objects if obj in words]

    return AnalyzeResponse(
        id=f"resp_{int(time.time())}",
        description=description.strip(),
        confidence=confidence,
        processingMs=processing_ms,
        detectedObjects=detected if detected else None,
        source=source,
    )


def _decode_image(image_str: str) -> str:
    """Strip data URL prefix from base64 image."""
    if "," in image_str:
        image_str = image_str.split(",", 1)[1]
    return image_str
