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
 */
export async function getSession(sessionId: number): Promise<WorkoutSessionDetails> {
  const response = await apiClient.get<{ data: WorkoutSessionDetails }>(`/sessions/${sessionId}`);
  return response.data.data;
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
 */
export async function createEvent(
  sessionId: number,
  data: CreateEventRequest
): Promise<SessionEvent> {
  const response = await apiClient.post<{ data: SessionEvent }>(
    `/sessions/${sessionId}/events`,
    data
  );
  return response.data.data;
}

/**
 * Update an existing event
 */
export async function updateEvent(
  sessionId: number,
  eventId: number,
  data: UpdateEventRequest
): Promise<SessionEvent> {
  const response = await apiClient.patch<{ data: SessionEvent }>(
    `/sessions/${sessionId}/events/${eventId}`,
    data
  );
  return response.data.data;
}

/**
 * Delete an event
 */
export async function deleteEvent(sessionId: number, eventId: number): Promise<void> {
  await apiClient.delete(`/sessions/${sessionId}/events/${eventId}`);
}

/**
 * Submit feedback for AI suggestions (select the correct exercise)
 */
export async function submitFeedback(
  sessionId: number,
  eventId: number,
  data: FeedbackRequest
): Promise<SessionEvent> {
  const response = await apiClient.post<{ data: SessionEvent }>(
    `/sessions/${sessionId}/events/${eventId}/feedback`,
    data
  );
  return response.data.data;
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
