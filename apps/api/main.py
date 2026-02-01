"""
VisionSathi API - Main Application

FastAPI backend for VisionSathi visual assistant.
Provides cloud inference endpoints using Moondream 3.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import health, analyze, conversation, modes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup/shutdown."""
    # Startup: Optionally preload Moondream model
    preload = os.getenv("PRELOAD_MODEL", "false").lower() == "true"

    if preload:
        print("Preloading Moondream model...")
        from services.moondream import get_moondream
        moondream = get_moondream()
        if moondream.load_model():
            print("Model preloaded successfully!")
        else:
            print("Warning: Model preload failed. Will load on first request.")
    else:
        print("Model will be loaded on first request (set PRELOAD_MODEL=true to preload)")

    yield

    # Shutdown: Cleanup
    print("Shutting down VisionSathi API...")


app = FastAPI(
    title="VisionSathi API",
    description="Visual assistant API powered by Moondream 3 for blind and visually impaired users",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(analyze.router, prefix="/analyze", tags=["Analyze"])
app.include_router(conversation.router, prefix="/conversation", tags=["Conversation"])
app.include_router(modes.router, prefix="/modes", tags=["Modes"])


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
