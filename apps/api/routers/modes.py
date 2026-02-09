"""
VisionSathi API - Modes Router

Specialized endpoints for Read and Navigate modes.
"""

import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from services.moondream import get_moondream
from prompts.describe import get_prompt_for_mode

router = APIRouter()


# ============================================
# Read Mode (OCR)
# ============================================


class ReadRequest(BaseModel):
    """Request for text reading."""

    image: str  # base64
    verbosity: str = "normal"


class TextBlock(BaseModel):
    """A block of detected text."""

    type: str  # heading, body, sign, label
    content: str
    position: Optional[str] = None


class ReadResponse(BaseModel):
    """Response for text reading."""

    id: str
    text: str
    textBlocks: List[TextBlock]
    processingMs: int
    source: str = "cloud"


@router.post("/read", response_model=ReadResponse)
async def read_text(request: ReadRequest):
    """
    Extract and read text from image (OCR mode).

    Optimized prompt for text detection and reading order.
    """
    start_time = time.time()

    moondream = get_moondream()

    if not await moondream.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not available. Make sure Ollama is running with the moondream model pulled."
        )

    try:
        image_base64 = moondream.decode_image(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    prompt = get_prompt_for_mode("read", request.verbosity)

    try:
        text, confidence, processing_ms = await moondream.analyze(
            image_base64, prompt
        )

        # Parse response into text blocks (simple heuristic)
        lines = text.strip().split("\n")
        text_blocks = []

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            # Detect type based on content
            block_type = "body"
            if i == 0 or line.isupper():
                block_type = "heading"
            elif "sign" in line.lower() or "label" in line.lower():
                block_type = "sign"

            text_blocks.append(TextBlock(
                type=block_type,
                content=line,
                position="detected"
            ))

        return ReadResponse(
            id=f"read_{int(time.time())}",
            text=text,
            textBlocks=text_blocks,
            processingMs=processing_ms,
            source="cloud",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Text reading failed: {str(e)}"
        )


# ============================================
# Navigate Mode
# ============================================


class NavigateRequest(BaseModel):
    """Request for navigation analysis."""

    image: str  # base64
    currentDirection: Optional[str] = "forward"
    verbosity: str = "normal"


class Obstacle(BaseModel):
    """Detected obstacle."""

    type: str
    position: str
    distance: str
    risk: str  # low, medium, high


class Exit(BaseModel):
    """Detected exit point."""

    type: str  # door, stairs, elevator, opening
    position: str
    distance: str


class NavigationInfo(BaseModel):
    """Navigation recommendation."""

    recommendation: str
    warnings: List[str]


class NavigateResponse(BaseModel):
    """Response for navigation analysis."""

    id: str
    summary: str
    obstacles: List[Obstacle]
    navigation: NavigationInfo
    exits: List[Exit]
    processingMs: int
    source: str = "cloud"


@router.post("/navigate", response_model=NavigateResponse)
async def analyze_for_navigation(request: NavigateRequest):
    """
    Analyze image for navigation assistance.

    Returns obstacles, clear paths, exits, and navigation recommendations.
    Warnings are prioritized for safety.
    """
    start_time = time.time()

    moondream = get_moondream()

    if not await moondream.is_loaded():
        raise HTTPException(
            status_code=503,
            detail="Model not available. Make sure Ollama is running with the moondream model pulled."
        )

    try:
        image_base64 = moondream.decode_image(request.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")

    prompt = get_prompt_for_mode("navigate", request.verbosity)

    try:
        response_text, confidence, processing_ms = await moondream.analyze(
            image_base64, prompt
        )

        # Parse response for structured data (heuristics)
        response_lower = response_text.lower()

        # Extract obstacles
        obstacles = []
        obstacle_keywords = ["chair", "table", "box", "bag", "person", "object", "obstacle"]
        for kw in obstacle_keywords:
            if kw in response_lower:
                # Try to extract position
                position = "ahead"
                if "left" in response_lower:
                    position = "left"
                elif "right" in response_lower:
                    position = "right"

                obstacles.append(Obstacle(
                    type=kw,
                    position=position,
                    distance="nearby",
                    risk="medium"
                ))
                break  # Just get first one for now

        # Extract exits
        exits = []
        if "door" in response_lower:
            position = "ahead"
            if "left" in response_lower:
                position = "left"
            elif "right" in response_lower:
                position = "right"
            exits.append(Exit(type="door", position=position, distance="visible"))

        if "stairs" in response_lower:
            exits.append(Exit(type="stairs", position="ahead", distance="visible"))

        # Generate warnings
        warnings = []
        if obstacles:
            warnings.append(f"{obstacles[0].type.title()} detected {obstacles[0].position}")
        if "careful" in response_lower or "caution" in response_lower:
            warnings.append("Proceed with caution")

        # Generate recommendation
        if "clear" in response_lower:
            recommendation = "Path appears clear. Proceed forward."
        elif obstacles:
            recommendation = f"Obstacle detected. Move {obstacles[0].position} to avoid."
        else:
            recommendation = "Proceed carefully."

        # Create summary
        summary = response_text.split(".")[0] + "." if response_text else "Unable to analyze."

        return NavigateResponse(
            id=f"nav_{int(time.time())}",
            summary=summary,
            obstacles=obstacles,
            navigation=NavigationInfo(
                recommendation=recommendation,
                warnings=warnings
            ),
            exits=exits,
            processingMs=processing_ms,
            source="cloud",
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Navigation analysis failed: {str(e)}"
        )
