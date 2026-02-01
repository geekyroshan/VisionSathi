"""
VisionSathi API - Modes Router

Specialized endpoints for Read and Navigate modes.
"""

import time
import base64
from io import BytesIO
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image

router = APIRouter()


# ============================================
# Read Mode (OCR)
# ============================================


class ReadRequest(BaseModel):
    """Request for text reading."""

    image: str  # base64
    verbosity: str = "normal"


class ReadResponse(BaseModel):
    """Response for text reading."""

    id: str
    text: str
    textBlocks: List[dict]
    processingMs: int
    source: str = "cloud"


@router.post("/read", response_model=ReadResponse)
async def read_text(request: ReadRequest):
    """
    Extract and read text from image (OCR mode).

    Optimized prompt for text detection and reading order.
    """
    start_time = time.time()

    # TODO: Moondream OCR inference
    # Placeholder
    text = "[OCR placeholder] Text content would appear here."
    text_blocks = [
        {"type": "heading", "content": "Sample Heading", "position": "top"},
        {"type": "body", "content": "Sample body text.", "position": "center"},
    ]

    processing_time = int((time.time() - start_time) * 1000)

    return ReadResponse(
        id=f"read_{int(time.time())}",
        text=text,
        textBlocks=text_blocks,
        processingMs=processing_time,
        source="cloud",
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

    # TODO: Moondream navigation inference
    # Placeholder
    summary = "Clear path ahead for approximately 5 meters."
    obstacles = [
        Obstacle(type="chair", position="right", distance="2 meters", risk="low"),
    ]
    exits = [
        Exit(type="door", position="ahead", distance="5 meters"),
    ]
    navigation = NavigationInfo(
        recommendation="Continue forward",
        warnings=["Chair on your right at 2 meters"],
    )

    processing_time = int((time.time() - start_time) * 1000)

    return NavigateResponse(
        id=f"nav_{int(time.time())}",
        summary=summary,
        obstacles=obstacles,
        navigation=navigation,
        exits=exits,
        processingMs=processing_time,
        source="cloud",
    )
