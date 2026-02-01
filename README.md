# VisionSathi

**"See the world through sound — with or without internet."**

VisionSathi ("Vision Friend" in Hindi) is an offline-first visual assistant for blind and visually impaired users. Powered by Moondream 3, a 2B parameter vision-language model that runs directly on your phone.

![VisionSathi Demo](docs/demo.gif)

## Features

- **Quick Tap** — Tap anywhere to get an instant scene description
- **Conversation Mode** — Hold to ask follow-up questions ("What color is it?")
- **Text Reading** — OCR for signs, menus, labels, documents
- **Navigation Assist** — Obstacle detection with distance and direction
- **Fully Offline** — Works without internet using on-device AI
- **Customizable Voice** — Speed, verbosity, and voice preferences

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo |
| On-Device ML | ONNX Runtime + Moondream 3 |
| Backend | FastAPI + Python |
| Cloud ML | Moondream 3 + PyTorch |
| State | Zustand |
| TTS | Native (expo-speech) |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator

### Mobile App

```bash
cd apps/mobile
npm install
npx expo start
```

### Backend API

```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Download Model

```bash
# Download ONNX model for on-device inference
./scripts/download-model.sh
```

## Project Structure

```
visionsathi/
├── apps/
│   ├── mobile/          # React Native + Expo
│   └── api/             # FastAPI backend
├── packages/
│   └── shared/          # Shared TypeScript types
├── docs/
│   └── plans/           # Design documents
├── scripts/             # Setup and utility scripts
├── prd.json             # Ralph PRD for automation
└── CLAUDE.md            # AI assistant instructions
```

## Accessibility

This app is built accessibility-first:

- WCAG AAA compliant (7:1 contrast ratio)
- Full VoiceOver/TalkBack support
- 64px+ touch targets
- Haptic and audio feedback
- Customizable speech settings

## Development

### Running Tests

```bash
# Mobile
cd apps/mobile && npm test

# API
cd apps/api && pytest
```

### Type Checking

```bash
cd apps/mobile && npm run typecheck
```

## Roadmap

- [x] Phase 1: Foundation (UI, Camera, Accessibility)
- [ ] Phase 2: Core AI (Moondream integration, ONNX)
- [ ] Phase 3: Voice & Conversation
- [ ] Phase 4: Modes & Polish

## License

MIT

## Author

Roshan Kharel — [Portfolio](https://roshankharel.com)

---

*Built with Claude Code + Ralph automation*
