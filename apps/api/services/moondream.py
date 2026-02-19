"""
VisionSathi - Moondream Service (Ollama Backend)

Handles image analysis via Ollama HTTP API running Moondream model.
"""

import time
from typing import Optional, Tuple, List, Dict

import httpx

from config import settings


class MoondreamService:
    """Service for Moondream vision-language model inference via Ollama."""

    _instance: Optional["MoondreamService"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._ollama_url = settings.ollama_url
            cls._instance._model_name = settings.ollama_model
        return cls._instance

    @classmethod
    def get_instance(cls) -> "MoondreamService":
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def is_loaded(self) -> bool:
        """Check if Ollama is running and has the Moondream model available."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self._ollama_url}/api/tags")
                response.raise_for_status()
                data = response.json()
                models = data.get("models", [])
                return any(
                    self._model_name in m.get("name", "")
                    for m in models
                )
        except Exception:
            return False

    def decode_image(self, base64_string: str) -> str:
        """
        Strip data URL prefix from base64 image string.

        Returns the raw base64 string suitable for Ollama API.
        """
        if "," in base64_string:
            base64_string = base64_string.split(",", 1)[1]
        return base64_string

    async def analyze(
        self,
        image_base64: str,
        prompt: str,
    ) -> Tuple[str, float, int]:
        """
        Analyze image with given prompt via Ollama.

        Args:
            image_base64: Base64-encoded image string (no data URL prefix).
            prompt: The text prompt describing what to analyze.

        Returns:
            Tuple of (description, confidence, processing_ms)
        """
        start_time = time.time()

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self._ollama_url}/api/chat",
                    json={
                        "model": self._model_name,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt,
                                "images": [image_base64],
                            }
                        ],
                        "stream": False,
                    },
                )
                response.raise_for_status()
                result = response.json()
                description = result["message"]["content"]
                processing_ms = int((time.time() - start_time) * 1000)

                # Estimate confidence based on response length and coherence
                confidence = min(0.95, 0.7 + len(description.split()) * 0.01)

                return description, confidence, processing_ms

        except httpx.HTTPStatusError as e:
            processing_ms = int((time.time() - start_time) * 1000)
            raise RuntimeError(
                f"Ollama API error (HTTP {e.response.status_code}): {e.response.text}"
            )
        except httpx.ConnectError:
            raise RuntimeError(
                f"Cannot connect to Ollama at {self._ollama_url}. "
                "Make sure Ollama is running (ollama serve)."
            )
        except Exception as e:
            processing_ms = int((time.time() - start_time) * 1000)
            raise RuntimeError(f"Inference failed: {e}")

    async def analyze_with_context(
        self,
        image_base64: Optional[str],
        prompt: str,
        history: List[Dict[str, str]],
    ) -> Tuple[str, float, int]:
        """
        Analyze with conversation context via Ollama chat API.

        Args:
            image_base64: Optional base64 image (None for text-only follow-ups).
            prompt: Current user question.
            history: Previous conversation messages as list of
                     {"role": "user"|"assistant", "content": "..."} dicts.

        Returns:
            Tuple of (response, confidence, processing_ms)
        """
        start_time = time.time()

        try:
            # Build messages array from history
            messages: List[dict] = []
            image_attached = False
            for msg in history[-10:]:  # Last 10 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if content and content != "[image]":
                    m: dict = {"role": role, "content": content}
                    # Attach image to the first user message so the model
                    # has visual context for the entire conversation
                    if not image_attached and role == "user" and image_base64:
                        m["images"] = [image_base64]
                        image_attached = True
                    messages.append(m)

            # Add current user message
            user_message: dict = {"role": "user", "content": prompt}
            # If no history had a user message, attach image to current message
            if not image_attached and image_base64:
                user_message["images"] = [image_base64]
            messages.append(user_message)

            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self._ollama_url}/api/chat",
                    json={
                        "model": self._model_name,
                        "messages": messages,
                        "stream": False,
                    },
                )
                response.raise_for_status()
                result = response.json()
                description = result["message"]["content"]
                processing_ms = int((time.time() - start_time) * 1000)

                confidence = min(0.92, 0.65 + len(description.split()) * 0.01)

                return description, confidence, processing_ms

        except httpx.HTTPStatusError as e:
            processing_ms = int((time.time() - start_time) * 1000)
            raise RuntimeError(
                f"Ollama API error (HTTP {e.response.status_code}): {e.response.text}"
            )
        except httpx.ConnectError:
            raise RuntimeError(
                f"Cannot connect to Ollama at {self._ollama_url}. "
                "Make sure Ollama is running (ollama serve)."
            )
        except Exception as e:
            processing_ms = int((time.time() - start_time) * 1000)
            raise RuntimeError(f"Contextual inference failed: {e}")


# Global singleton
moondream_service = MoondreamService.get_instance()


def get_moondream() -> MoondreamService:
    """Get the Moondream service instance."""
    return moondream_service
