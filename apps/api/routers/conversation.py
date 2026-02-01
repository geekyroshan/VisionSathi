"""
VisionSathi API - Conversation Router

Multi-turn conversation with context.
"""

import time
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from PIL import Image

from services.moondream import get_moondream
from prompts.describe import get_prompt_for_mode

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


# In-memory conversation store with image cache
# In production, use Redis or similar
conversations: Dict[str, dict] = {}


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

    moondream = get_moondream()

    # Check if model is loaded
    if not moondream.is_loaded():
        if not moondream.load_model():
            raise HTTPException(
                status_code=503,
                detail="Model not available. Please try again later."
            )

    # Generate or use existing conversation ID
    conv_id = request.conversationId or f"conv_{uuid.uuid4().hex[:8]}"

    # Get or create conversation state
    conv_state = conversations.get(conv_id, {
        "history": [],
        "last_image": None,
    })

    # Decode new image if provided
    current_image: Optional[Image.Image] = None
    if request.image:
        try:
            current_image = moondream.decode_image(request.image)
            conv_state["last_image"] = request.image  # Store for follow-ups
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image: {str(e)}")
    elif conv_state.get("last_image"):
        # Use cached image for follow-up questions
        try:
            current_image = moondream.decode_image(conv_state["last_image"])
        except Exception:
            pass

    if current_image is None:
        raise HTTPException(
            status_code=400,
            detail="No image available. Please provide an image for new conversations."
        )

    # Build conversation prompt
    history_context = []
    for msg in request.history[-5:]:  # Last 5 messages
        if msg.content and msg.content != "[image]":
            history_context.append({"role": msg.role, "content": msg.content})

    # Create contextual prompt
    if history_context:
        context_str = "\n".join([
            f"Previous {m['role']}: {m['content']}"
            for m in history_context
        ])
        full_prompt = (
            f"Context from our conversation:\n{context_str}\n\n"
            f"Current question: {request.message}\n\n"
            f"Please answer based on what you see in the image and our conversation context."
        )
    else:
        # First message - use mode-based prompt
        base_prompt = get_prompt_for_mode("describe", request.verbosity)
        full_prompt = f"{base_prompt}\n\nUser question: {request.message}"

    try:
        # Run inference
        response_text, confidence, processing_ms = moondream.analyze(
            current_image,
            full_prompt
        )

        # Update conversation state
        conv_state["history"].append(
            ConversationMessage(role="user", content=request.message)
        )
        conv_state["history"].append(
            ConversationMessage(role="assistant", content=response_text)
        )
        conversations[conv_id] = conv_state

        # Estimate token usage
        context_tokens = sum(len(m.content.split()) for m in conv_state["history"])

        return ConversationResponse(
            conversationId=conv_id,
            response=response_text,
            confidence=confidence,
            processingMs=processing_ms,
            contextTokensUsed=context_tokens,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Conversation failed: {str(e)}"
        )


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str):
    """
    Retrieve conversation history.

    - **conversation_id**: The conversation to retrieve
    """
    if conversation_id not in conversations:
        raise HTTPException(
            status_code=404,
            detail=f"Conversation {conversation_id} not found"
        )

    conv = conversations[conversation_id]
    return {
        "conversationId": conversation_id,
        "history": conv["history"],
        "hasImage": conv.get("last_image") is not None,
    }


@router.delete("/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation.

    - **conversation_id**: The conversation to delete
    """
    if conversation_id in conversations:
        del conversations[conversation_id]
        return {"deleted": True, "conversationId": conversation_id}

    raise HTTPException(
        status_code=404,
        detail=f"Conversation {conversation_id} not found"
    )
