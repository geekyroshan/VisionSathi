# VisionSathi — Design Document

**Date**: February 1, 2026
**Author**: Roshan Kharel
**Status**: Approved for Implementation

---

## 1. Product Vision

### VisionSathi — Offline-First Visual Assistant for the Blind

**Tagline**: "See the world through sound — with or without internet."

**Name Origin**: "Sathi" means "friend" in Hindi. VisionSathi = Vision Friend.

### Core Value Proposition

VisionSathi is a mobile app that gives blind and visually impaired users real-time visual understanding through their phone's camera. Powered by Moondream 3 (2B parameter vision-language model) running directly on-device, it works completely offline while offering enhanced capabilities when connected.

### What Makes It Portfolio-Worthy

| Skill Demonstrated | How |
|--------------------|-----|
| Edge AI | Moondream 3 via ONNX Runtime on mobile |
| Full Stack | React Native frontend + Python FastAPI backend |
| Offline-First Architecture | Graceful degradation patterns |
| Accessibility-First Design | WCAG AAA compliance, VoiceOver/TalkBack |
| Social Impact | Solves real problems for 285M+ visually impaired people globally |

### Target Audience

Primary: Blind and visually impaired users who need:
- Independence in daily navigation
- Ability to read text (signs, menus, labels)
- Social awareness of their environment
- Works without internet dependency

### The Two Interaction Modes

1. **Quick Tap** — Single tap anywhere captures frame, returns concise description via TTS
2. **Conversation Mode** — Hold button to enter dialogue. Ask follow-ups ("What color?", "How far?"). Moondream's 32k context maintains conversation history.

### MVP Feature Set

- Scene description (primary)
- Text reading / OCR (signs, labels, menus)
- Navigation assistance (obstacles, doors, stairs)
- Customizable TTS (speed, verbosity, voice)

---

## 2. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VISIONSATHI                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Camera     │───▶│  Frame       │───▶│  Moondream   │       │
│  │   Module     │    │  Processor   │    │  ONNX Local  │       │
│  └──────────────┘    └──────────────┘    └──────┬───────┘       │
│                                                  │               │
│                              ┌───────────────────┴────────┐     │
│                              ▼                            ▼     │
│                    ┌──────────────┐            ┌──────────────┐ │
│                    │ Offline Mode │            │ Online Mode  │ │
│                    │ (On-Device)  │            │ (Cloud API)  │ │
│                    └──────┬───────┘            └──────┬───────┘ │
│                           │                           │         │
│                           └───────────┬───────────────┘         │
│                                       ▼                         │
│                            ┌──────────────────┐                 │
│                            │ Response Manager │                 │
│                            │ (Context + TTS)  │                 │
│                            └────────┬─────────┘                 │
│                                     ▼                           │
│                            ┌──────────────────┐                 │
│                            │  Native TTS      │                 │
│                            │  (Customizable)  │                 │
│                            └──────────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                              │ When Online
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   /analyze   │    │  Moondream   │    │   Response   │       │
│  │   Endpoint   │───▶│  GPU Server  │───▶│   Cache      │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Mobile App** | React Native + Expo | Cross-platform, portfolio-friendly |
| **On-Device ML** | ONNX Runtime Mobile | Optimized inference, Moondream compatible |
| **Camera** | expo-camera + expo-image-manipulator | Frame capture, preprocessing |
| **TTS** | expo-speech (native engines) | Offline, customizable, no API costs |
| **Backend** | FastAPI + Python | Async, fast, ML-friendly |
| **Cloud ML** | Moondream 3 + PyTorch | GPU inference when online |
| **State** | Zustand | Lightweight, simple |
| **Storage** | AsyncStorage + SQLite | Conversation history, preferences |

### Offline-First Decision Flow

1. User taps → Capture frame
2. Check network status
3. If OFFLINE or user prefers local → Run Moondream ONNX on-device (~2-4 sec)
4. If ONLINE and cloud enabled → Send to FastAPI (~0.5-1 sec) → Fallback if fails
5. Cache response for conversation context
6. Speak via TTS

---

## 3. UI/UX Design System

### Design Principles

1. **Touch-anywhere simplicity** — Entire screen is a button
2. **Audio-first feedback** — Every action confirmed by sound/haptic
3. **High contrast WCAG AAA** — 7:1 contrast ratio minimum
4. **Large touch targets** — Minimum 64px
5. **Consistent spatial layout** — Controls never move

### Color System

| Token | Hex | Usage |
|-------|-----|-------|
| Background Primary | #0A0A0B | Main app background |
| Background Elevated | #141416 | Cards, modals |
| Surface | #1E1E22 | Interactive elements |
| Text Primary | #FFFFFF | Main text |
| Text Secondary | #A0A0A8 | Labels, hints |
| Accent Action | #00D4AA | Primary buttons, active states |
| Accent Listening | #6366F1 | Recording/listening state |
| Accent Warning | #F59E0B | Caution states |
| Accent Error | #EF4444 | Error states |
| Border Subtle | #2A2A30 | Dividers |
| Border Focus | #00D4AA | Focus rings |

### Typography

- **Font Family**: System Default (SF Pro / Roboto)
- **Heading Large**: 32px / Bold
- **Heading**: 24px / Semibold
- **Body**: 18px / Regular (larger than standard for accessibility)
- **Caption**: 14px / Medium

### Haptic & Audio Feedback

| Action | Haptic | Sound |
|--------|--------|-------|
| Tap to capture | Medium impact | Soft "click" |
| Hold to converse | Light continuous | Rising tone |
| Processing | None | Subtle pulse |
| Response ready | Success notif | Gentle chime |
| Error | Error pattern | Low tone |

---

## 4. API Design

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /health | GET | Health check + model status |
| /analyze | POST | Single image analysis |
| /conversation | POST | Multi-turn with context |
| /conversation/{id} | GET | Retrieve conversation history |
| /modes/read | POST | OCR-optimized text extraction |
| /modes/navigate | POST | Navigation-focused analysis |

### Request/Response Models

**POST /analyze**
```json
// Request
{
  "image": "base64_encoded_image",
  "mode": "describe" | "read" | "navigate",
  "verbosity": "brief" | "normal" | "detailed",
  "language": "en"
}

// Response
{
  "id": "resp_abc123",
  "description": "A wooden door is open ahead...",
  "confidence": 0.92,
  "processingMs": 487,
  "detectedObjects": ["door", "light", "room"],
  "source": "cloud"
}
```

**POST /conversation**
```json
// Request
{
  "conversationId": "conv_xyz789",
  "image": "base64_encoded_image",
  "message": "What color is the door?",
  "history": [...],
  "verbosity": "normal"
}

// Response
{
  "conversationId": "conv_xyz789",
  "response": "The door appears to be dark brown...",
  "confidence": 0.88,
  "processingMs": 312,
  "contextTokensUsed": 1247
}
```

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- Project setup, design system, camera integration
- Basic UI shell with accessibility

### Phase 2: Core AI (Week 2)
- FastAPI backend with Moondream
- ONNX on-device integration
- Quick tap flow end-to-end

### Phase 3: Voice & Conversation (Week 3)
- TTS integration with customization
- Conversation mode with context
- Settings screen

### Phase 4: Modes & Polish (Week 4)
- Text reading (OCR) mode
- Navigation assistance mode
- Offline fallback logic
- Final polish, animations, haptics

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| Offline inference time | < 4 seconds on iPhone 12 / Pixel 6 |
| Cloud inference time | < 1 second |
| App cold start | < 3 seconds (model lazy-loaded) |
| Accessibility audit | 100% VoiceOver/TalkBack compatible |

---

## 7. Technical Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Moondream ONNX export issues | Spike early, fallback to smaller model |
| ONNX too slow on older devices | Offer cloud-only mode, minimum device requirements |
| Model size too large | Quantization, progressive download |
| TTS quality varies by device | Test on multiple devices, offer voice selection |

---

**Document approved for implementation.**
