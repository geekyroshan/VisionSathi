/**
 * VisionSathi - API Service
 *
 * Client for communicating with FastAPI backend.
 */

import Constants from 'expo-constants';
import type {
  AnalyzeRequest,
  AnalyzeResponse,
  ConversationRequest,
  ConversationResponse,
  NavigationResponse,
} from '../../../packages/shared/types';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';
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
      `${API_BASE_URL}/health`,
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/analyze`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/conversation`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/modes/read`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/modes/navigate`, {
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
