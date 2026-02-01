"""
VisionSathi API - Analyze Router

Single-shot image analysis endpoint.
"""

import time
import base64
from io import BytesIO
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from PIL import Image

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


def decode_image(base64_string: str) -> Image.Image:
    """Decode base64 image string to PIL Image."""
    try:
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_bytes = base64.b64decode(base64_string)
        image = Image.open(BytesIO(image_bytes))
        return image.convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")


def get_prompt_for_mode(mode: str, verbosity: str) -> str:
    """Get Moondream prompt based on mode and verbosity."""
    prompts = {
        "describe": {
            "brief": "Describe what you see in one sentence, focusing on the most important elements for a blind person.",
            "normal": "Describe this scene for a blind person. Include key objects, their positions, and any text visible.",
            "detailed": "Describe this scene in detail for a blind person. Include: objects and their positions, distances, potential obstacles, text visible, people present, lighting conditions.",
        },
        "read": {
            "brief": "Read the main text visible in this image.",
            "normal": "Read all text visible in this image, in reading order.",
            "detailed": "Read all text visible in this image. Present it in reading order, noting the type of text (sign, label, document, etc.) and its location.",
        },
        "navigate": {
            "brief": "Is the path ahead clear? Any obstacles?",
            "normal": "Analyze for navigation: clear path distance, obstacles with positions, exits or doors.",
            "detailed": "Analyze for navigation. List: clear path ahead (distance), all obstacles (type, position, distance, risk level), exits/doors, stairs or elevation changes, hazards.",
        },
    }

    return prompts.get(mode, prompts["describe"]).get(verbosity, prompts["describe"]["normal"])


@router.post("", response_model=AnalyzeResponse)
async def analyze_image(request: AnalyzeRequest):
    """
    Analyze an image and return description.

    - **image**: Base64 encoded image
    - **mode**: Analysis mode (describe, read, navigate)
    - **verbosity**: Response length (brief, normal, detailed)
    """
    start_time = time.time()

    # Decode image
    image = decode_image(request.image)

    # Get appropriate prompt
    prompt = get_prompt_for_mode(request.mode, request.verbosity)

    # TODO: Run Moondream inference
    # from services.moondream import run_inference
    # description = await run_inference(image, prompt)

    # Placeholder response
    description = f"[Moondream inference placeholder] Mode: {request.mode}, Verbosity: {request.verbosity}"

    processing_time = int((time.time() - start_time) * 1000)

    return AnalyzeResponse(
        id=f"resp_{int(time.time())}",
        description=description,
        confidence=0.95,
        processingMs=processing_time,
        detectedObjects=["placeholder"],
        source="cloud",
    )
