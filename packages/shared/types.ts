/**
 * VisionSathi - Shared Types
 *
 * Types shared between mobile app and API.
 */

// ============================================
// Request/Response Types
// ============================================

export interface AnalyzeRequest {
  image: string; // base64 encoded
  mode: 'describe' | 'read' | 'navigate';
  verbosity: 'brief' | 'normal' | 'detailed';
  language?: string;
}

export interface AnalyzeResponse {
  id: string;
  description: string;
  confidence: number;
  processingMs: number;
  detectedObjects?: string[];
  source: 'cloud' | 'local';
}

export interface ConversationRequest {
  conversationId: string | null;
  image?: string; // base64, optional for follow-ups
  message: string;
  history: ConversationMessage[];
  verbosity: 'brief' | 'normal' | 'detailed';
}

export interface ConversationResponse {
  conversationId: string;
  response: string;
  confidence: number;
  processingMs: number;
  contextTokensUsed: number;
}

export interface NavigationResponse {
  id: string;
  summary: string;
  obstacles: Obstacle[];
  navigation: {
    recommendation: string;
    warnings: string[];
  };
  exits: Exit[];
  processingMs: number;
  source: 'cloud' | 'local';
}

// ============================================
// Domain Types
// ============================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  timestamp: number;
}

export interface Obstacle {
  type: string;
  position: 'left' | 'right' | 'center' | 'ahead';
  distance: string;
  risk: 'low' | 'medium' | 'high';
}

export interface Exit {
  type: 'door' | 'stairs' | 'elevator' | 'opening';
  position: string;
  distance: string;
}

// ============================================
// User Preferences
// ============================================

export interface UserPreferences {
  // Voice settings
  speechSpeed: 0.75 | 1.0 | 1.25;
  verbosity: 'brief' | 'normal' | 'detailed';
  voiceId: string;

  // Processing settings
  preferOffline: boolean;
  cloudFallback: boolean;

  // Accessibility settings
  hapticEnabled: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
}

export const defaultPreferences: UserPreferences = {
  speechSpeed: 1.0,
  verbosity: 'normal',
  voiceId: 'default',
  preferOffline: false,
  cloudFallback: true,
  hapticEnabled: true,
  soundEnabled: true,
  highContrast: true,
};

// ============================================
// App State Types
// ============================================

export type AppMode = 'describe' | 'read' | 'navigate' | 'conversation';

export type ProcessingState = 'idle' | 'capturing' | 'processing' | 'speaking' | 'listening';

export type ConnectionState = 'online' | 'offline' | 'checking';
