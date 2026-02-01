# VisionSathi - AI Assistant Instructions

## Project Overview

VisionSathi ("Vision Friend" in Hindi) is an offline-first visual assistant app for blind and visually impaired users. It uses Moondream 3 (2B parameter VLM) to describe scenes, read text, and assist navigation — all via voice.

## Tech Stack

- **Mobile**: React Native + Expo (Expo Router for navigation)
- **State**: Zustand
- **Backend**: FastAPI + Python
- **ML**: Moondream 3 (ONNX for mobile, PyTorch for server)
- **TTS**: expo-speech (native engines)

## Project Structure

```
visionsathi/
├── apps/
│   ├── mobile/          # React Native app
│   └── api/             # FastAPI backend
├── packages/
│   └── shared/          # Shared types
└── docs/plans/          # Design documents
```

## Code Patterns

### Mobile App

1. **Components**: Functional components with TypeScript
2. **Styling**: StyleSheet.create with design tokens from `constants/colors.ts`
3. **State**: Zustand stores in `stores/` directory
4. **Hooks**: Custom hooks in `hooks/` for reusable logic
5. **Accessibility**: All interactive elements MUST have `accessibilityLabel` and `accessibilityRole`

### API

1. **Routers**: One file per resource in `routers/`
2. **Services**: Business logic in `services/`
3. **Models**: Pydantic models in `models/`
4. **Prompts**: Moondream prompts in `prompts/`

## Accessibility Requirements (CRITICAL)

This is an accessibility-first app. Every PR must:

- [ ] Include `accessibilityLabel` on all touchable elements
- [ ] Include `accessibilityRole` (button, header, text, etc.)
- [ ] Include `accessibilityHint` for non-obvious actions
- [ ] Use minimum 64px touch targets
- [ ] Test with VoiceOver (iOS) or TalkBack (Android)
- [ ] Maintain 7:1 contrast ratio (WCAG AAA)

## Design Tokens

```typescript
// Always use these, never hardcode colors
import { colors } from '@/constants/colors';

colors.background.primary    // #0A0A0B
colors.background.elevated   // #141416
colors.text.primary          // #FFFFFF
colors.accent.action         // #00D4AA
colors.accent.listening      // #6366F1
```

## Common Commands

```bash
# Mobile development
cd apps/mobile
npx expo start                    # Start dev server
npm test                          # Run tests
npm run typecheck                 # TypeScript check

# API development
cd apps/api
uvicorn main:app --reload         # Start dev server
pytest                            # Run tests
```

## Moondream Prompts

When working with Moondream, use these prompt patterns:

**Scene Description (Brief)**:
```
Describe what you see in one sentence, focusing on the most important elements for a blind person navigating this space.
```

**Scene Description (Detailed)**:
```
Describe this scene in detail for a blind person. Include: objects and their positions, distances, potential obstacles, text visible, people present, lighting conditions.
```

**Text Reading (OCR)**:
```
Read all text visible in this image. Present it in reading order, noting the type of text (sign, label, document, etc.).
```

**Navigation**:
```
Analyze this scene for navigation. List: clear path ahead (distance), obstacles (type, position, distance), exits/doors, stairs or elevation changes, hazards.
```

## Testing Requirements

- Unit tests for all utility functions
- Integration tests for API endpoints
- Accessibility audit must pass
- Test offline mode explicitly

## Git Workflow

- Branch naming: `feat/story-id-description` or `fix/story-id-description`
- Commit format: `feat: [F-1] Add camera view component`
- All commits must pass typecheck and lint

## Mistakes to Avoid

### Mobile
- Never use inline colors — always use design tokens
- Never skip accessibility labels — this is an a11y app
- Don't block UI during inference — show loading state
- Don't forget haptic feedback on interactions

### API
- Never return raw model output — always structure response
- Don't skip input validation — images can be malformed
- Always include processing time in response for monitoring

## When Claude Makes Mistakes

If Claude does something incorrectly on this project, add it here:

```markdown
### [Date] - [Issue]
- What happened: ...
- Correct behavior: ...
```

---

**Last Updated**: February 1, 2026
