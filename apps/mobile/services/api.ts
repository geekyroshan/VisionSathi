/**
 * VisionSathi - API Service
 *
 * Client for communicating with FastAPI backend.
 */

import Constants from 'expo-constants';
import { useSettingsStore } from '@/stores/settingsStore';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ConversationRequest,
  ConversationResponse,
  NavigationResponse,
} from '../../../packages/shared/types';

import { Platform } from 'react-native';

// On Android emulator, localhost refers to the emulator itself.
// Use 10.0.2.2 to reach the host machine's localhost.
const DEFAULT_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8000'
  : 'http://localhost:8000';

// Dynamic API URL - checks settings store first
function getApiUrl(): string {
  // Try settings store (user-configured URL)
  const settingsUrl = useSettingsStore.getState().serverUrl;
  if (settingsUrl) return settingsUrl;

  // Fall back to platform-aware default
  // (Don't use expoConfig.extra.apiUrl as it may contain localhost which
  // doesn't work on Android emulator)
  return DEFAULT_API_URL;
}

const TIMEOUT_MS = 30000; // 30 seconds - Moondream inference can take time

/**
 * Custom error for API failures
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public shouldFallback: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', undefined, true);
    }
    throw error;
  }
}

/**
 * Check if API is reachable
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(
      `${getApiUrl()}/health`,
      { method: 'GET' },
      3000
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Analyze image (single-shot)
 */
export async function analyzeImage(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  try {
    const response = await fetchWithTimeout(`${getApiUrl()}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new ApiError(
        `API error: ${response.statusText}`,
        response.status,
        response.status >= 500
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      undefined,
      true
    );
  }
}

/**
 * Send conversation message
 */
export async function sendConversation(
  request: ConversationRequest
): Promise<ConversationResponse> {
  try {
    const response = await fetchWithTimeout(`${getApiUrl()}/conversation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new ApiError(
        `API error: ${response.statusText}`,
        response.status,
        response.status >= 500
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      undefined,
      true
    );
  }
}

/**
 * Read text from image (OCR mode)
 */
export async function readText(
  image: string,
  verbosity: 'brief' | 'normal' | 'detailed' = 'normal'
): Promise<{ text: string; textBlocks: any[]; processingMs: number }> {
  try {
    const response = await fetchWithTimeout(`${getApiUrl()}/modes/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, verbosity }),
    });

    if (!response.ok) {
      throw new ApiError(`API error: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Navigation analysis
 */
export async function analyzeForNavigation(
  image: string,
  verbosity: 'brief' | 'normal' | 'detailed' = 'normal'
): Promise<NavigationResponse> {
  try {
    const response = await fetchWithTimeout(`${getApiUrl()}/modes/navigate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image, verbosity }),
    });

    if (!response.ok) {
      throw new ApiError(`API error: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}
