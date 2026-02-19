# OpenAI Fallback + Sathi Personality Design

**Date**: 2026-02-16
**Status**: Approved

## Overview

Add OpenAI GPT-4o as automatic fallback when Moondream/Ollama is unavailable, and give VisionSathi a warm human guide personality ("Sathi") across all responses.

## Fallback Chain

```
Request → Ollama/Moondream (local, free) → OpenAI GPT-4o (cloud, paid) → Friendly error
```

- Mobile app receives `source: "moondream" | "openai"` in every response
- Fallback is transparent to user — they just get a response
- OpenAI API key lives server-side only (`OPENAI_API_KEY` env var)

## Sathi Personality

Sathi ("friend/companion" in Hindi) is a warm, caring human guide who becomes the user's eyes.

**Tone**: Like a close friend walking beside you. Casual but clear. Never patronizing.
**Speech patterns**:
- "I can see..." / "There's a..." / "Looks like..."
- Safety info first, then details
- Encouraging: "You're all clear ahead" not "No obstacles detected"
- Natural reactions: "Oh, there's a nice café on your right" not "Commercial establishment detected at 3 o'clock"

**For OpenAI**: Full personality via system prompt
**For Moondream**: Lighter personality hints in user prompts (2B model, keep practical)

## Changes

### New Files
- `apps/api/services/openai_service.py` — OpenAI GPT-4o vision client
- `apps/api/prompts/personality.py` — Sathi system prompt + personality wrapper

### Modified Files
- `apps/api/config.py` — Add openai_api_key, openai_model
- `apps/api/services/moondream.py` — Add fallback-aware error handling
- `apps/api/routers/analyze.py` — Try Moondream → fallback to OpenAI
- `apps/api/routers/conversation.py` — Try Moondream → fallback to OpenAI
- `apps/api/routers/modes.py` — Try Moondream → fallback to OpenAI
- `apps/api/prompts/describe.py` — Warmer Sathi-style prompts
- `apps/api/requirements.txt` — Add openai SDK
