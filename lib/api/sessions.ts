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
  ClarificationRequest,
  Clarification,
} from './types';

// ============================================
// Raw API Response Types (what Laravel returns)
// ============================================

interface RawAiParseRun {
  id?: number;
  status: string;
  confidence?: string | number | null;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  output_json: {
    action_type?: string;
    confidence?: number;
    exercise?: { id?: number | null; name: string };
    sets?: Array<{
      set_count?: number;
      reps: number;
      weight: number | null;
      unit: string;
      rpe?: number | null;
    }>;
    symptom?: { body_part: string; symptom_type?: string };
    readiness?: { signal_type: string; value_text?: string; value_score?: number };
    note?: { text: string };
  } | null;
}

interface RawClarification {
  type: 'ambiguity' | 'missing_info';
  message: string;
  options?: Array<{ label: string; payload: Record<string, unknown> }>;
  missing_field?: 'reps' | 'weight' | 'set_count' | null;
  partial_payload?: Record<string, unknown> | null;
}

interface RawSessionEvent {
  id: number;
  action_type: string;
  applied?: boolean;
  suggestions?: Array<{ label: string; output_json: Record<string, any> }> | null;
  clarification?: RawClarification | null;
  // Both casings — show endpoint uses snake_case, store/update/feedback use camelCase
  text_input?: { raw_text: string } | null;
  textInput?: { raw_text: string } | null;
  ai_parse_run?: RawAiParseRun | null;
  aiParseRun?: RawAiParseRun | null;
  created_at: string;
  updated_at: string;
}

interface RawWorkoutSessionDetails extends Omit<WorkoutSessionDetails, 'session_events'> {
  session_events?: RawSessionEvent[];
  sessionEvents?: RawSessionEvent[];
}

// ============================================
// Transformer Functions
// ============================================

/**
 * Normalize event status from backend variants to frontend status type
 * Handles all known backend status variants and defaults unknown statuses to 'completed'
 * to ensure events always remain visible
 */
function normalizeEventStatus(rawStatus: string | null | undefined): SessionEvent['status'] {
  if (!rawStatus) return 'queued';

  const statusLower = rawStatus.toLowerCase();

  // Map all known backend status variants
  if (statusLower === 'queued' || statusLower === 'pending') return 'queued';
  if (statusLower === 'processing' || statusLower === 'running' || statusLower === 'in_progress') return 'processing';
  if (statusLower === 'completed' || statusLower === 'success' || statusLower === 'done') return 'completed';
  if (statusLower === 'failed' || statusLower === 'error') return 'failed';
  if (statusLower === 'needs_clarification') return 'needs_clarification';

  // Unknown status - default to 'completed' so event is visible
  console.warn(`[normalizeEventStatus] Unknown status: "${rawStatus}", defaulting to 'completed'`);
  return 'completed';
}

/**
 * Transform raw API event to frontend SessionEvent
 * Maps the nested Laravel model structure to the flat frontend structure
 * Handles both camelCase (store/update/feedback) and snake_case (show) responses
 */
function transformSessionEvent(raw: RawSessionEvent): SessionEvent {
  // Resolve both camelCase and snake_case variants
  const textInput = raw.textInput ?? raw.text_input;
  const aiParseRun = raw.aiParseRun ?? raw.ai_parse_run;
  const outputJson = aiParseRun?.output_json;

  // Normalize status using comprehensive mapping
  const normalizedStatus = normalizeEventStatus(aiParseRun?.status);

  // Expand sets by set_count (e.g., set_count: 3 → 3 identical set entries)
  const expandedSets = outputJson?.sets?.flatMap((s, baseIndex) => {
    const count = s.set_count ?? 1;
    return Array.from({ length: count }, (_, i) => ({
      id: baseIndex * 100 + i,
      set_number: baseIndex * 100 + i + 1, // will be renumbered below
      weight_kg: s.weight,
      reps: s.reps,
      rpe: s.rpe ?? null,
      unit: s.unit ?? 'kg',
      completed: true,
    }));
  }) ?? null;

  // Renumber sets sequentially
  if (expandedSets) {
    expandedSets.forEach((s, i) => {
      s.id = i;
      s.set_number = i + 1;
    });
  }

  // Transform suggestions from flat API array to frontend structure
  const suggestions = raw.suggestions && raw.suggestions.length > 0
    ? {
        options: raw.suggestions.map((s) => ({
          exercise_name: s.output_json?.exercise?.name ?? s.label,
          confidence: s.output_json?.confidence as number | undefined,
          label: s.label,
        })),
        selected_index: null as number | null,
      }
    : null;

  // Transform clarification if present
  const clarification: Clarification | null = raw.clarification ? {
    type: raw.clarification.type,
    message: raw.clarification.message,
    options: raw.clarification.options ?? [],
    missing_field: raw.clarification.missing_field ?? null,
    partial_payload: raw.clarification.partial_payload ?? null,
  } : null;

  return {
    id: raw.id,
    type: raw.action_type as SessionEvent['type'],
    raw_text: textInput?.raw_text ?? '',
    status: normalizedStatus as SessionEvent['status'],
    exercise_name: outputJson?.exercise?.name ?? null,
    sets: expandedSets,
    suggestions,
    clarification,
    ai_parse_run: aiParseRun ? {
      id: aiParseRun.id ?? 0,
      status: normalizedStatus as 'pending' | 'processing' | 'completed' | 'failed',
      started_at: aiParseRun.started_at ?? null,
      completed_at: aiParseRun.completed_at ?? null,
      error_message: aiParseRun.error_message ?? null,
    } : null,
    symptom: outputJson?.symptom ?? null,
    readiness: outputJson?.readiness ?? null,
    note: outputJson?.note ?? null,
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
  const rawEvents = raw.session_events ?? raw.sessionEvents ?? [];

  return {
    ...raw,
    session_events: rawEvents.map(transformSessionEvent),
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

/**
 * Submit clarification response (provide missing value or select option)
 * Transforms raw API response to match frontend types
 */
export async function submitClarification(
  sessionId: number,
  eventId: number,
  data: ClarificationRequest
): Promise<SessionEvent> {
  const response = await apiClient.post<{ data: RawSessionEvent }>(
    `/sessions/${sessionId}/events/${eventId}/clarify`,
    data
  );
  return transformSessionEvent(response.data.data);
}

// ============================================
// Weekly Stats
// ============================================

interface WeeklyStatsResponse {
  volume_kg: number;
  volume_lb: number;
  workouts_count: number;
  duration_seconds: number;
  duration_hours: number;
  avg_rpe: number | null;
  sets_count: number;
  reps_count: number;
  week_start: string;
  week_end: string;
}

/**
 * Get weekly stats from the API
 */
export async function getWeeklyStats(): Promise<WeeklyStatsResponse> {
  const response = await apiClient.get<{ data: WeeklyStatsResponse }>('/weekly-stats');
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
