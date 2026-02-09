"""
VisionSathi API - Transcribe Router

Audio transcription endpoint (placeholder for on-device STT).
"""

from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel

router = APIRouter()


class TranscribeResponse(BaseModel):
    """Response model for audio transcription."""

    text: str
    language: str = "en"
    processingMs: int = 0


@router.post("", response_model=TranscribeResponse)
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio to text.

    This is a placeholder endpoint. Speech-to-text is handled on-device
    via expo-speech-recognition for lower latency and offline support.

    - **audio**: Audio file (WAV, MP3, etc.)
    """
    # Placeholder - STT handled on-device via expo-speech-recognition
    return TranscribeResponse(
        text="",
        language="en",
        processingMs=0,
    )
