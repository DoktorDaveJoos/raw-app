import { apiClient } from './client';
import type {
  WorkoutSessionSummary,
  WorkoutSessionDetails,
  SessionEvent,
  PaginatedSessionsResponse,
  SessionFilters,
  CreateEventRequest,
  UpdateEventRequest,
  FeedbackRequest,
} from './types';

// ============================================
// Raw API Response Types (what Laravel returns)
// ============================================

interface RawSessionEvent {
  id: number;
  action_type: string;
  text_input: { raw_text: string } | null;
  ai_parse_run: {
    id?: number;
    status: string;
    started_at?: string | null;
    completed_at?: string | null;
    error_message?: string | null;
    output_json: {
      exercise?: { name: string };
      sets?: Array<{
        reps: number;
        weight: number;
        unit: string;
        rpe?: number | null;
      }>;
    } | null;
  } | null;
  created_at: string;
  updated_at: string;
}

interface RawWorkoutSessionDetails extends Omit<WorkoutSessionDetails, 'session_events'> {
  session_events: RawSessionEvent[];
}

// ============================================
// Transformer Functions
// ============================================

/**
 * Transform raw API event to frontend SessionEvent
 * Maps the nested Laravel model structure to the flat frontend structure
 */
function transformSessionEvent(raw: RawSessionEvent): SessionEvent {
  const outputJson = raw.ai_parse_run?.output_json;

  // Normalize status: backend returns 'success', frontend expects 'completed'
  const rawStatus = raw.ai_parse_run?.status ?? 'queued';
  const normalizedStatus = rawStatus === 'success' ? 'completed' : rawStatus;

  return {
    id: raw.id,
    type: raw.action_type as SessionEvent['type'],
    raw_text: raw.text_input?.raw_text ?? '',
    status: normalizedStatus as SessionEvent['status'],
    exercise_name: outputJson?.exercise?.name ?? null,
    sets: outputJson?.sets?.map((s, i) => ({
      id: i,
      set_number: i + 1,
      weight_kg: s.weight,
      reps: s.reps,
      rpe: s.rpe ?? null,
      completed: true,
    })) ?? null,
    suggestions: null,
    ai_parse_run: raw.ai_parse_run ? {
      id: raw.ai_parse_run.id ?? 0,
      status: normalizedStatus as 'pending' | 'processing' | 'completed' | 'failed',
      started_at: raw.ai_parse_run.started_at ?? null,
      completed_at: raw.ai_parse_run.completed_at ?? null,
      error_message: raw.ai_parse_run.error_message ?? null,
    } : null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

// ============================================
// Sessions API Functions
// ============================================

/**
 * Get list of sessions with optional filters
 */
export async function getSessions(filters?: SessionFilters): Promise<PaginatedSessionsResponse> {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.per_page) params.append('per_page', filters.per_page.toString());

  const response = await apiClient.get<PaginatedSessionsResponse>('/sessions', { params });
  return response.data;
}

/**
 * Get a single session by ID with full details
 * Transforms raw API response to match frontend types
 */
export async function getSession(sessionId: number): Promise<WorkoutSessionDetails> {
  const response = await apiClient.get<{ data: RawWorkoutSessionDetails }>(`/sessions/${sessionId}`);
  const raw = response.data.data;

  return {
    ...raw,
    session_events: raw.session_events.map(transformSessionEvent),
  };
}

/**
 * Create a new session
 */
export async function createSession(title?: string): Promise<WorkoutSessionSummary> {
  const response = await apiClient.post<{ data: WorkoutSessionSummary }>('/sessions', {
    title: title || null,
  });
  return response.data.data;
}

/**
 * Start a session (change status to in_progress)
 */
export async function startSession(sessionId: number): Promise<WorkoutSessionSummary> {
  const response = await apiClient.post<{ data: WorkoutSessionSummary }>(`/sessions/${sessionId}/start`);
  return response.data.data;
}

/**
 * Finish a session (change status to finished)
 */
export async function finishSession(sessionId: number): Promise<WorkoutSessionSummary> {
  const response = await apiClient.post<{ data: WorkoutSessionSummary }>(`/sessions/${sessionId}/finish`);
  return response.data.data;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: number): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}`);
}

// ============================================
// Session Events API Functions
// ============================================

/**
 * Create a new event (e.g., add sets via natural language)
 * Transforms raw API response to match frontend types
 */
export async function createEvent(
  sessionId: number,
  data: CreateEventRequest
): Promise<SessionEvent> {
  const response = await apiClient.post<{ data: RawSessionEvent }>(
    `/sessions/${sessionId}/events`,
    data
  );
  return transformSessionEvent(response.data.data);
}

/**
 * Update an existing event
 * Transforms raw API response to match frontend types
 */
export async function updateEvent(
  sessionId: number,
  eventId: number,
  data: UpdateEventRequest
): Promise<SessionEvent> {
  const response = await apiClient.patch<{ data: RawSessionEvent }>(
    `/sessions/${sessionId}/events/${eventId}`,
    data
  );
  return transformSessionEvent(response.data.data);
}

/**
 * Delete an event
 */
export async function deleteEvent(sessionId: number, eventId: number): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}/events/${eventId}`);
}

/**
 * Submit feedback for AI suggestions (select the correct exercise)
 * Transforms raw API response to match frontend types
 */
export async function submitFeedback(
  sessionId: number,
  eventId: number,
  data: FeedbackRequest
): Promise<SessionEvent> {
  const response = await apiClient.post<{ data: RawSessionEvent }>(
    `/sessions/${sessionId}/events/${eventId}/feedback`,
    data
  );
  return transformSessionEvent(response.data.data);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get the current in-progress session, if any
 */
export async function getCurrentSession(): Promise<WorkoutSessionSummary | null> {
  const response = await getSessions({ status: 'in_progress', per_page: 1 });
  return response.data.length > 0 ? response.data[0] : null;
}

/**
 * Create and start a new session in one call
 */
export async function createAndStartSession(title?: string): Promise<WorkoutSessionDetails> {
  const session = await createSession(title);
  // Do NOT call startSession - the API auto-starts sessions on creation
  // The /start endpoint is only for resuming paused sessions
  return await getSession(session.id);
}
