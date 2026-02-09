"""
VisionSathi API - Analyze Router

Single-shot image analysis endpoint.
"""

import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from services.moondream import get_moondream
from prompts.describe import get_prompt_for_mode

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

    - **image**: Base64 encoded image
    - **mode**: Analysis mode (describe, read, navigate)
    - **verbosity**: Response length (brief, normal, detailed)
    """
    start_time = time.time()

    moondream = get_moondream()

    # Check if Ollama model is available
    if not await moondream.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not available. Make sure Ollama is running with the moondream model pulled."
        )

    try:
        # Decode image: strip data URL prefix, get raw base64
        image_base64 = moondream.decode_image(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    # Get appropriate prompt
    prompt = get_prompt_for_mode(request.mode, request.verbosity)

    try:
        # Run inference via Ollama
        description, confidence, processing_ms = await moondream.analyze(
            image_base64, prompt
        )

        # Extract detected objects (simple heuristic)
        words = description.lower().split()
        common_objects = [
            "door", "window", "chair", "table", "person", "car", "tree",
            "sign", "light", "stairs", "wall", "floor", "ceiling", "road",
            "sidewalk", "building", "phone", "book", "cup", "bottle"
        ]
        detected = [obj for obj in common_objects if obj in words]

        return AnalyzeResponse(
            id=f"resp_{int(time.time())}",
            description=description,
            confidence=confidence,
            processingMs=processing_ms,
            detectedObjects=detected if detected else None,
            source="cloud",
        )

    except Exception as e:
        # Fallback to error response
        processing_time = int((time.time() - start_time) * 1000)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
