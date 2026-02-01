"""
VisionSathi - Moondream Service

Handles Moondream model loading and inference.
"""

import base64
import time
from io import BytesIO
from typing import Optional, Tuple
from PIL import Image
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

from config import settings


class MoondreamService:
    """Service for Moondream vision-language model inference."""

    _instance: Optional["MoondreamService"] = None
    _model = None
    _tokenizer = None
    _device: str = "cpu"
    _loaded: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def get_instance(cls) -> "MoondreamService":
        """Get singleton instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_model(self) -> bool:
        """Load Moondream model into memory."""
        if self._loaded:
            return True

        try:
            print(f"Loading Moondream model: {settings.moondream_model}")
            print(f"Device: {settings.moondream_device}")

            # Determine device
            if settings.moondream_device == "cuda" and torch.cuda.is_available():
                self._device = "cuda"
            elif settings.moondream_device == "mps" and torch.backends.mps.is_available():
                self._device = "mps"
            else:
                self._device = "cpu"

            print(f"Using device: {self._device}")

            # Load model with appropriate dtype
            dtype = torch.float16 if settings.moondream_dtype == "float16" and self._device != "cpu" else torch.float32

            self._model = AutoModelForCausalLM.from_pretrained(
                settings.moondream_model,
                trust_remote_code=True,
                torch_dtype=dtype,
                device_map={"": self._device} if self._device != "cpu" else None,
            )

            if self._device == "cpu":
                self._model = self._model.to(self._device)

            self._tokenizer = AutoTokenizer.from_pretrained(
                settings.moondream_model,
                trust_remote_code=True,
            )

            self._loaded = True
            print("Moondream model loaded successfully!")
            return True

        except Exception as e:
            print(f"Failed to load Moondream model: {e}")
            self._loaded = False
            return False

    def is_loaded(self) -> bool:
        """Check if model is loaded."""
        return self._loaded

    def decode_image(self, base64_string: str) -> Image.Image:
        """Decode base64 image string to PIL Image."""
        # Remove data URL prefix if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_bytes = base64.b64decode(base64_string)
        image = Image.open(BytesIO(image_bytes))
        return image.convert("RGB")

    def analyze(
        self,
        image: Image.Image,
        prompt: str,
    ) -> Tuple[str, float, int]:
        """
        Analyze image with given prompt.

        Returns:
            Tuple of (description, confidence, processing_ms)
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        start_time = time.time()

        try:
            # Encode image
            enc_image = self._model.encode_image(image)

            # Generate response
            response = self._model.answer_question(
                enc_image,
                prompt,
                self._tokenizer,
            )

            processing_ms = int((time.time() - start_time) * 1000)

            # Estimate confidence based on response length and coherence
            confidence = min(0.95, 0.7 + len(response.split()) * 0.01)

            return response, confidence, processing_ms

        except Exception as e:
            processing_ms = int((time.time() - start_time) * 1000)
            raise RuntimeError(f"Inference failed: {e}")

    def analyze_with_context(
        self,
        image: Optional[Image.Image],
        prompt: str,
        history: list,
    ) -> Tuple[str, float, int]:
        """
        Analyze with conversation context.

        Args:
            image: Optional new image (None for follow-ups)
            prompt: Current user question
            history: Previous conversation messages

        Returns:
            Tuple of (response, confidence, processing_ms)
        """
        if not self._loaded:
            raise RuntimeError("Model not loaded. Call load_model() first.")

        start_time = time.time()

        try:
            # Build context prompt
            context_parts = []
            for msg in history[-10:]:  # Last 10 messages for context
                role = msg.get("role", "user")
                content = msg.get("content", "")
                if content and content != "[image]":
                    context_parts.append(f"{role}: {content}")

            context_parts.append(f"user: {prompt}")
            full_prompt = "\n".join(context_parts)

            # Use cached image encoding if available
            if image:
                enc_image = self._model.encode_image(image)
            else:
                # For follow-ups without new image, use simpler prompt
                full_prompt = f"Based on the previous image description, {prompt}"
                # We need an image for Moondream, so this is a limitation
                raise ValueError("Follow-up questions require the original image context")

            response = self._model.answer_question(
                enc_image,
                full_prompt,
                self._tokenizer,
            )

            processing_ms = int((time.time() - start_time) * 1000)
            confidence = min(0.92, 0.65 + len(response.split()) * 0.01)

            return response, confidence, processing_ms

        except Exception as e:
            processing_ms = int((time.time() - start_time) * 1000)
            raise RuntimeError(f"Contextual inference failed: {e}")


# Global singleton
moondream_service = MoondreamService.get_instance()


def get_moondream() -> MoondreamService:
    """Get the Moondream service instance."""
    return moondream_service
