"""
VisionSathi API - Conversation Router

Multi-turn conversation with context.
"""

import time
import uuid
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List

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


# In-memory conversation store (use Redis in production)
conversations: dict = {}


@router.post("", response_model=ConversationResponse)
async def create_or_continue_conversation(request: ConversationRequest):
    """
    Create or continue a conversation.

    - **conversationId**: Existing conversation ID (null for new)
    - **image**: Base64 image (optional for follow-up questions)
    - **message**: User's question or command
    - **history**: Previous messages for context
    - **verbosity**: Response length preference
    """
    start_time = time.time()

    # Generate or use existing conversation ID
    conv_id = request.conversationId or f"conv_{uuid.uuid4().hex[:8]}"

    # Build context from history
    context = []
    for msg in request.history:
        context.append(f"{msg.role}: {msg.content}")

    # Add current message
    context.append(f"user: {request.message}")

    # TODO: Run Moondream inference with context
    # from services.moondream import run_conversation
    # response = await run_conversation(image, context, request.verbosity)

    # Placeholder response
    response_text = f"[Conversation response placeholder] Question: {request.message}"

    processing_time = int((time.time() - start_time) * 1000)

    # Store conversation state
    conversations[conv_id] = {
        "history": request.history + [
            ConversationMessage(role="user", content=request.message),
            ConversationMessage(role="assistant", content=response_text),
        ]
    }

    return ConversationResponse(
        conversationId=conv_id,
        response=response_text,
        confidence=0.90,
        processingMs=processing_time,
        contextTokensUsed=len(" ".join(context).split()),
    )


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    """
    Retrieve conversation history.

    - **conversation_id**: The conversation to retrieve
    """
    if conversation_id not in conversations:
        return {"error": "Conversation not found", "conversationId": conversation_id}

    return {
        "conversationId": conversation_id,
        "history": conversations[conversation_id]["history"],
    }
