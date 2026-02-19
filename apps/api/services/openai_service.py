"""
VisionSathi - OpenAI Vision Service (Fallback)

Provides GPT-4o vision analysis as fallback when Moondream/Ollama is unavailable.
"""

import time
from typing import Optional, Tuple, List, Dict

from config import settings


class OpenAIService:
    """Service for OpenAI GPT-4o vision inference as fallback."""

    _instance: Optional["OpenAIService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._api_key = settings.openai_api_key
            cls._instance._model = settings.openai_model
            cls._instance._client = None
        return cls._instance

    @classmethod
    def get_instance(cls) -> "OpenAIService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _get_client(self):
        """Lazy-init the OpenAI client."""
        if self._client is None:
            if not self._api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY not set. Cannot use OpenAI fallback."
                )
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=self._api_key)
        return self._client

    def is_available(self) -> bool:
        """Check if OpenAI fallback is configured (API key present)."""
        return bool(self._api_key)

    async def analyze(
        self,
        image_base64: str,
        system_prompt: str,
        user_prompt: str = "What do you see?",
    ) -> Tuple[str, float, int]:
        """
        Analyze image with GPT-4o vision.

        Args:
            image_base64: Raw base64-encoded image (no data URL prefix).
            system_prompt: Sathi personality + mode instructions.
            user_prompt: The user's specific question.

        Returns:
            Tuple of (description, confidence, processing_ms)
        """
        start_time = time.time()
        client = self._get_client()

        response = await client.chat.completions.create(
            model=self._model,
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": user_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "low",
                            },
                        },
                    ],
                },
            ],
            max_tokens=500,
        )

        description = response.choices[0].message.content or ""
        processing_ms = int((time.time() - start_time) * 1000)
        confidence = 0.90  # GPT-4o is generally high confidence

        return description, confidence, processing_ms

    async def analyze_with_context(
        self,
        image_base64: Optional[str],
        system_prompt: str,
        user_prompt: str,
        history: List[Dict[str, str]],
    ) -> Tuple[str, float, int]:
        """
        Multi-turn conversation with GPT-4o vision.

        Args:
            image_base64: Optional base64 image.
            system_prompt: Sathi personality prompt.
            user_prompt: Current user message.
            history: Previous conversation messages.

        Returns:
            Tuple of (response, confidence, processing_ms)
        """
        start_time = time.time()
        client = self._get_client()

        messages: list = [{"role": "system", "content": system_prompt}]

        # Add history, attaching image to first user message
        image_attached = False
        for msg in history[-10:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if not content or content == "[image]":
                continue

            if not image_attached and role == "user" and image_base64:
                messages.append({
                    "role": "user",
                    "content": [
                        {"type": "text", "text": content},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}",
                                "detail": "low",
                            },
                        },
                    ],
                })
                image_attached = True
            else:
                messages.append({"role": role, "content": content})

        # Add current user message
        if not image_attached and image_base64:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}",
                            "detail": "low",
                        },
                    },
                ],
            })
        else:
            messages.append({"role": "user", "content": user_prompt})

        response = await client.chat.completions.create(
            model=self._model,
            messages=messages,
            max_tokens=500,
        )

        description = response.choices[0].message.content or ""
        processing_ms = int((time.time() - start_time) * 1000)
        confidence = 0.90

        return description, confidence, processing_ms


# Global singleton
openai_service = OpenAIService.get_instance()


def get_openai() -> OpenAIService:
    """Get the OpenAI service instance."""
    return openai_service
