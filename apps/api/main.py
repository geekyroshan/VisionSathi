"""
VisionSathi API - Main Application

FastAPI backend for VisionSathi visual assistant.
Provides cloud inference endpoints using Moondream via Ollama.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import health, analyze, conversation, modes, transcribe


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    print("Starting VisionSathi API...")
    print(f"Ollama URL: {settings.ollama_url}")
    print(f"Ollama model: {settings.ollama_model}")

    # Check if Ollama is reachable at startup
    from services.moondream import get_moondream
    moondream = get_moondream()
    if await moondream.is_loaded():
        print(f"Ollama is running and model '{settings.ollama_model}' is available.")
    else:
        print(
            f"Warning: Ollama model '{settings.ollama_model}' not found. "
            f"Make sure Ollama is running and the model is pulled: "
            f"ollama pull {settings.ollama_model}"
        )

    # Check OpenAI fallback availability
    from services.openai_service import get_openai
    openai_svc = get_openai()
    if openai_svc.is_available():
        print(f"OpenAI fallback configured (model: {settings.openai_model})")
    else:
        print("Warning: OPENAI_API_KEY not set. OpenAI fallback disabled.")

    yield

    # Shutdown
    print("Shutting down VisionSathi API...")


app = FastAPI(
    title="VisionSathi API",
    description="Visual assistant API powered by Moondream via Ollama for blind and visually impaired users",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration - allow all origins for dev (mobile + local network)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
app.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
app.include_router(modes.router, prefix="/modes", tags=["Modes"])
app.include_router(transcribe.router, prefix="/transcribe", tags=["Transcribe"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "VisionSathi API",
        "version": "1.0.0",
        "status": "running",
        "description": "Visual assistant for blind and visually impaired users",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
