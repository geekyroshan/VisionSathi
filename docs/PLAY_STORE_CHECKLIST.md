# VisionSathi - Google Play Store Submission Checklist

Complete this checklist before submitting VisionSathi to the Google Play Store.

---

## Phase 1: Development Prerequisites

### EAS Build Setup
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login to Expo: `eas login`
- [ ] Initialize EAS project: `cd apps/mobile && eas init`
- [ ] Copy EAS Project ID to `app.config.ts`
- [ ] Test development build: `eas build --profile development --platform android`

### Backend API Deployment
- [ ] Create Railway/Render account
- [ ] Deploy API from `apps/api/` using provided Dockerfile
- [ ] Configure environment variables on hosting platform
- [ ] Update `API_URL` in `eas.json` production profile
- [ ] Verify API health endpoint: `curl https://your-api.railway.app/health`
- [ ] Test API with production URL from mobile app

---

## Phase 2: App Store Assets

### App Icons (Required)
- [ ] **App icon**: 512x512 PNG (no transparency) - `assets/icon.png`
- [ ] **Adaptive icon foreground**: 432x432 PNG - `assets/adaptive-icon.png`
- [ ] **Feature graphic**: 1024x500 PNG/JPG (for store listing)

### Screenshots (Required - minimum 2)
- [ ] Phone screenshots: 1080x1920 or 1080x2340 (at least 2)
- [ ] 7-inch tablet: 1200x1920 (recommended)
- [ ] 10-inch tablet: 1800x2560 (recommended)

**Suggested screenshots:**
1. Main camera view with description displayed
2. Voice command in action (listening state)
3. Settings/accessibility options
4. Mode selector (Scene/Text/Navigate)

### Promotional Assets
- [ ] Short description (80 chars max)
- [ ] Full description (4000 chars max)
- [ ] Promo video (optional, YouTube link)

---

## Phase 3: Store Listing Content

### App Information
```
App Name: VisionSathi
Short Description: AI-powered visual assistant for blind and visually impaired users

Full Description:
VisionSathi ("Vision Friend") is an AI-powered visual assistant designed to help
blind and visually impaired users understand their surroundings through voice.

Key Features:
- Scene Description: Point your camera and tap to hear what's around you
- Text Reading: Capture signs, documents, or labels to have them read aloud
- Navigation Assist: Get guidance about obstacles and paths ahead
- Conversation Mode: Hold to ask follow-up questions about what you see
- Fully Voice-Controlled: Designed for use without sight

Accessibility Features:
- TalkBack/VoiceOver optimized
- High contrast UI (WCAG AAA compliant)
- Haptic feedback for all interactions
- Large touch targets (64px minimum)
- Audio-first design

VisionSathi works best with an internet connection but provides graceful
offline fallbacks. Your privacy matters - images are processed securely
and not stored.

Built with love for the visually impaired community.
```

### Category & Tags
- [ ] Primary category: **Tools** or **Accessibility**
- [ ] Content rating: Complete questionnaire (likely "Everyone")
- [ ] Tags: accessibility, blind, visually impaired, AI, vision, assistant

---

## Phase 4: Legal & Compliance

### Privacy Policy (REQUIRED)
- [ ] Create privacy policy page (can use a free service like Termly)
- [ ] Host at public URL (e.g., GitHub Pages, Notion public page)
- [ ] Must include:
  - What data is collected (camera images, voice recordings)
  - How data is used (processed for AI, not stored)
  - Third-party services (Moondream API)
  - Contact information
  - User rights

**Sample privacy policy URL format:** `https://geekyroshan.github.io/visionsathi-privacy`

### Declarations
- [ ] Ads declaration: No ads
- [ ] App access: Public (no login required)
- [ ] Data safety form: Complete in Play Console
- [ ] Government apps: No
- [ ] Health apps: Complete health features form if applicable

### Permissions Justification
Document why each permission is needed:
| Permission | Reason |
|------------|--------|
| CAMERA | Core functionality - captures images for AI analysis |
| RECORD_AUDIO | Voice commands for hands-free operation |

---

## Phase 5: Testing & Quality

### Accessibility Testing (CRITICAL for this app)
- [ ] Test with TalkBack enabled on Android device
- [ ] Verify all buttons have accessibility labels
- [ ] Test screen reader announces responses correctly
- [ ] Verify haptic feedback works
- [ ] Test with different TalkBack speech rates

### Functional Testing
- [ ] Camera capture works on multiple devices
- [ ] Voice commands are recognized
- [ ] TTS speaks responses clearly
- [ ] All three modes work (Scene/Text/Navigate)
- [ ] Conversation mode maintains context
- [ ] Settings persist across app restarts
- [ ] App handles network errors gracefully

### Device Compatibility
- [ ] Test on Android 10+ (API 29+)
- [ ] Test on at least 3 different screen sizes
- [ ] Test on low-end device for performance

---

## Phase 6: Build & Release

### Generate Production Build
```bash
cd apps/mobile

# Create production build
eas build --profile production --platform android

# This generates an AAB file for Play Store
```

### App Signing
- [ ] Let EAS manage signing (recommended for first release)
- [ ] Or: Create upload keystore and configure in `eas.json`

**Important:** Back up your keystore! You cannot update the app without it.

### Internal Testing Track
- [ ] Upload AAB to Play Console
- [ ] Create internal testing release first
- [ ] Add test emails to internal testers
- [ ] Test the production build thoroughly

---

## Phase 7: Play Console Submission

### Developer Account
- [ ] Create Google Play Developer account ($25 one-time fee)
- [ ] Complete identity verification
- [ ] Set up payments (if app will be paid/have IAP)

### Create App in Play Console
1. [ ] Go to play.google.com/console
2. [ ] Click "Create app"
3. [ ] Select "App" (not game)
4. [ ] Choose "Free"
5. [ ] Accept declarations

### App Content
- [ ] Upload screenshots and feature graphic
- [ ] Write store listing (short & full descriptions)
- [ ] Set privacy policy URL
- [ ] Complete content rating questionnaire
- [ ] Complete data safety form
- [ ] Set target audience and content

### Release
- [ ] Upload AAB file
- [ ] Fill release notes
- [ ] Select countries for distribution
- [ ] Submit for review

---

## Post-Submission

### Review Timeline
- First submission: 1-7 days typically
- Updates: 1-3 days typically

### If Rejected
- Read rejection reason carefully
- Common issues:
  - Missing privacy policy
  - Incomplete data safety form
  - Metadata issues (screenshots, descriptions)
  - Permission justification needed
  - Policy violations

### After Approval
- [ ] Monitor crash reports in Play Console
- [ ] Respond to user reviews
- [ ] Plan update cycle
- [ ] Consider localization for Hindi, other languages

---

## Quick Command Reference

```bash
# EAS CLI Commands
eas login                                    # Login to Expo
eas init                                     # Initialize project
eas build --profile production --platform android  # Production build
eas submit --platform android                # Submit to Play Store

# Local testing
cd apps/mobile
npx expo start --tunnel                      # Start dev server
eas build --profile preview --platform android  # Test APK build
```

---

## Resources

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Android Accessibility Guidelines](https://developer.android.com/guide/topics/ui/accessibility)
- [Privacy Policy Generator](https://www.termly.io/products/privacy-policy-generator/)

---

**Estimated time to complete:** 2-4 hours (excluding review wait time)

**Last Updated:** February 1, 2026
