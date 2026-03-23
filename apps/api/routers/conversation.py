"""
VisionSathi API - Conversation Router

Multi-turn conversation with context. Moondream → OpenAI fallback.
"""

import time
import uuid
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict

from services.moondream import get_moondream
from services.openai_service import get_openai
from prompts.describe import get_prompt_for_mode
from prompts.personality import SATHI_SYSTEM_PROMPT

logger = logging.getLogger(__name__)
router = APIRouter()


class ConversationMessage(BaseModel):
    """A single message in conversation history."""

    role: str  # user or assistant
    content: str
    type: Optional[str] = "text"  # text or image


class ConversationRequest(BaseModel):
    """Request model for conversation."""

    conversationId: Optional[str] = None
    image: Optional[str] = None  # base64, optional for follow-ups
    message: str
    history: List[ConversationMessage] = []
    verbosity: str = "normal"


class ConversationResponse(BaseModel):
    """Response model for conversation."""

    conversationId: str
    response: str
    confidence: float
    processingMs: int
    contextTokensUsed: int
    source: str = "local"


# In-memory conversation store with image cache
conversations: Dict[str, dict] = {}


def _decode_image(image_str: str) -> str:
    """Strip data URL prefix from base64 image."""
    if "," in image_str:
        image_str = image_str.split(",", 1)[1]
    return image_str


@router.post("", response_model=ConversationResponse)
async def create_or_continue_conversation(request: ConversationRequest):
    """
    Create or continue a conversation.

    Tries Moondream via Ollama first, falls back to OpenAI GPT-4o.
    """
    start_time = time.time()

    # Generate or use existing conversation ID
    conv_id = request.conversationId or f"conv_{uuid.uuid4().hex[:8]}"

    # Get or create conversation state
    conv_state = conversations.get(
        conv_id,
        {
            "history": [],
            "last_image_base64": None,
        },
    )

    # Decode new image if provided
    current_image_base64: Optional[str] = None
    if request.image:
        try:
            current_image_base64 = _decode_image(request.image)
            conv_state["last_image_base64"] = current_image_base64
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
    elif conv_state.get("last_image_base64"):
        current_image_base64 = conv_state["last_image_base64"]

    if current_image_base64 is None:
        raise HTTPException(
            status_code=400,
            detail="No image available. Please provide an image for new conversations.",
        )

    # Build conversation history
    history_messages = []
    for msg in request.history[-5:]:
        if msg.content and msg.content != "[image]":
            history_messages.append({"role": msg.role, "content": msg.content})

    source = "moondream"
    response_text = ""
    confidence = 0.0
    processing_ms = 0

    # Try Moondream first
    moondream = get_moondream()
    try:
        if not await moondream.is_loaded():
            raise RuntimeError("Moondream not loaded")

        if history_messages:
            (
                response_text,
                confidence,
                processing_ms,
            ) = await moondream.analyze_with_context(
                current_image_base64,
                request.message,
                history_messages,
            )
        else:
            base_prompt = get_prompt_for_mode("describe", request.verbosity)
            full_prompt = f"{base_prompt}\n\nUser question: {request.message}"
            response_text, confidence, processing_ms = await moondream.analyze(
                current_image_base64,
                full_prompt,
            )
    except Exception as e:
        logger.info(f"Moondream unavailable ({e}), trying OpenAI fallback...")

        openai_svc = get_openai()
        if not openai_svc.is_available():
            raise HTTPException(
                status_code=503,
                detail="I'm having trouble seeing right now. Neither Moondream nor OpenAI is available.",
            )

        try:
            if history_messages:
                (
                    response_text,
                    confidence,
                    processing_ms,
                ) = await openai_svc.analyze_with_context(
                    current_image_base64,
                    system_prompt=SATHI_SYSTEM_PROMPT,
                    user_prompt=request.message,
                    history=history_messages,
                )
            else:
                base_prompt = get_prompt_for_mode("describe", request.verbosity)
                full_prompt = f"{base_prompt}\n\nUser question: {request.message}"
                response_text, confidence, processing_ms = await openai_svc.analyze(
                    current_image_base64,
                    system_prompt=SATHI_SYSTEM_PROMPT,
                    user_prompt=full_prompt,
                )
            source = "cloud"
        except Exception as fallback_error:
            raise HTTPException(
                status_code=500,
                detail=f"Both Moondream and OpenAI failed. Last error: {fallback_error}",
            )

    # Update conversation state
    conv_state["history"].append(
        ConversationMessage(role="user", content=request.message)
    )
    conv_state["history"].append(
        ConversationMessage(role="assistant", content=response_text)
    )
    conversations[conv_id] = conv_state

    context_tokens = sum(len(m.content.split()) for m in conv_state["history"])

    return ConversationResponse(
        conversationId=conv_id,
        response=response_text.strip(),
        confidence=confidence,
        processingMs=processing_ms,
        contextTokensUsed=context_tokens,
        source=source,
    )


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Retrieve conversation history."""
    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404, detail=f"Conversation {conversation_id} not found"
        )

    conv = conversations[conversation_id]
    return {
        "conversationId": conversation_id,
        "history": conv["history"],
        "hasImage": conv.get("last_image_base64") is not None,
    }


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation."""
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"deleted": True, "conversationId": conversation_id}

    raise HTTPException(
        status_code=404, detail=f"Conversation {conversation_id} not found"
    )
