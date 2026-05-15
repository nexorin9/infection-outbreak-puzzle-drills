const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface PuzzleSession {
  session_id: string;
  status: string;
  start_time: string;
  message?: string;
}

export interface VerificationResult {
  correct: boolean;
  message: string;
  next_clue_id: string | null;
  score_delta: number;
}

export interface Clue {
  clue_id: string;
  rule_id: string;
  description: string;
  data_checkpoints: Array<{
    type: string;
    required_fields: string;
    filter_logic: string;
  }>;
  hint: string;
}

export interface SessionStatus {
  session_id: string;
  current_clue_index: number;
  completed_clues: string[];
  score: number;
  status: string;
  start_time: string;
  end_time: string | null;
  hints_used: number;
}

export interface DrillReport {
  session_id: string;
  start_time: string;
  end_time: string;
  clues_verified: string[];
  score: number;
  grade: string;
  timeline_summary: Array<{
    time: string;
    event_type: string;
    description: string;
  }>;
  recommendations: string[];
}

export interface SimulationResult {
  start_time: string;
  end_time: string;
  alerts: Array<{
    rule_id: string;
    rule_name: string;
    triggered: boolean;
    details: Record<string, unknown>;
  }>;
  clues: Array<{
    clue_id: string;
    rule_id: string;
    description: string;
  }>;
  summary: Record<string, unknown>;
}

// Error class for API errors with status code
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

// Sleep utility
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fetch with retry
async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig = DEFAULT_RETRY_CONFIG
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Check if response is retryable
      if (!response.ok && retryConfig.retryableStatusCodes.includes(response.status)) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          true
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if we've exhausted retries
      if (attempt >= retryConfig.maxRetries) {
        break;
      }

      // Don't retry non-retryable errors immediately
      if (error instanceof APIError && !error.isRetryable) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryConfig.retryDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after retries');
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function startPuzzle(): Promise<PuzzleSession> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/puzzle/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new APIError('Failed to start puzzle', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error while starting puzzle');
  }
}

export async function verifyCheckpoint(
  sessionId: string,
  clueId: string,
  answer: string
): Promise<VerificationResult> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/puzzle/${sessionId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clue_id: clueId, answer }),
    });
    if (!response.ok) {
      throw new APIError('Failed to verify checkpoint', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error while verifying checkpoint');
  }
}

export async function getCurrentClue(sessionId: string): Promise<Clue> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/puzzle/${sessionId}/clue`);
    if (!response.ok) {
      throw new APIError('Failed to get current clue', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error while getting current clue');
  }
}

export async function getSessionStatus(sessionId: string): Promise<SessionStatus> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/puzzle/${sessionId}/status`);
    if (!response.ok) {
      throw new APIError('Failed to get session status', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error while getting session status');
  }
}

export async function getReport(sessionId: string): Promise<DrillReport> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/report/${sessionId}`);
    if (!response.ok) {
      throw new APIError('Failed to get report', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error while getting report');
  }
}

export async function runSimulation(durationHours: number = 168): Promise<SimulationResult> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}/simulation/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ duration_hours: durationHours }),
    });
    if (!response.ok) {
      throw new APIError('Failed to run simulation', response.status);
    }
    return response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Network error while running simulation');
  }
}