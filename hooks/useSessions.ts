import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions,
  getSession,
  createSession,
  startSession,
  finishSession,
  createAndStartSession,
  createEvent,
  submitFeedback,
  submitClarification,
} from '@/lib/api';
import { queryKeys, invalidateSessions, invalidateSession } from '@/lib/store';
import type { WorkoutSessionSummary, WorkoutSessionDetails, SessionEvent } from '@/lib/api';

interface UseSessionsOptions {
  status?: 'pending' | 'in_progress' | 'finished';
  enabled?: boolean;
}

/**
 * Hook to fetch list of sessions
 */
export function useSessions(options: UseSessionsOptions = {}) {
  const { status, enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.sessions.list({ status }),
    queryFn: () => getSessions({ status }),
    enabled,
  });
}

/**
 * Hook to fetch a single session by ID
 * Uses structuralSharing to preserve optimistic events during polling
 */
export function useSession(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
    structuralSharing: (oldData, newData) => {
      if (!oldData || !newData) return newData;

      const oldSession = oldData as WorkoutSessionDetails;
      const newSession = newData as WorkoutSessionDetails;

      // Preserve optimistic events (negative IDs) not yet confirmed by server
      const serverIds = new Set(newSession.session_events.map(e => e.id));
      const serverRawTexts = new Set(newSession.session_events.map(e => e.raw_text));

      const optimisticEvents = (oldSession.session_events ?? []).filter(e => {
        if (e.id >= 0) return false;
        if (serverIds.has(e.id)) return false;
        if (serverRawTexts.has(e.raw_text)) return false;
        return true;
      });

      // If no optimistic events to preserve, return new data as-is
      if (optimisticEvents.length === 0) return newData;

      return {
        ...newSession,
        session_events: [...newSession.session_events, ...optimisticEvents],
      };
    },
  });
}

/**
 * Hook to get current in-progress session
 */
export function useCurrentSession() {
  return useQuery({
    queryKey: queryKeys.sessions.current,
    queryFn: async () => {
      const response = await getSessions({ status: 'in_progress', per_page: 1 });
      return response.data.length > 0 ? response.data[0] : null;
    },
  });
}

/**
 * Hook to create a new session
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      invalidateSessions();
    },
  });
}

/**
 * Hook to start a session
 */
export function useStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => startSession(sessionId),
    onSuccess: () => {
      invalidateSessions();
    },
  });
}

/**
 * Hook to finish a session
 */
export function useFinishSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: number) => finishSession(sessionId),
    onSuccess: () => {
      invalidateSessions();
    },
  });
}

/**
 * Hook to create and start a session in one call
 */
export function useCreateAndStartSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAndStartSession,
    onSuccess: () => {
      invalidateSessions();
    },
  });
}

/**
 * Hook to create a new event (e.g., add sets via natural language)
 */
export function useCreateEvent(sessionId: number) {
  const queryClient = useQueryClient();
  const resolvedOptimisticIds = useRef<Set<number>>(new Set());

  const mutation = useMutation({
    mutationFn: (rawText: string) => createEvent(sessionId, { raw_text: rawText }),
    // Never retry event creation - a retry after a "failed" request that actually
    // succeeded server-side would create a duplicate event
    retry: false,
    onMutate: async (rawText) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.detail(sessionId) });

      // Snapshot the previous value
      const previousSession = queryClient.getQueryData<WorkoutSessionDetails>(
        queryKeys.sessions.detail(sessionId)
      );

      // Generate a consistent optimistic ID for this mutation
      const optimisticId = -Date.now();

      // Create the optimistic event
      const optimisticEvent: SessionEvent = {
        id: optimisticId,
        type: 'add_sets',
        raw_text: rawText,
        status: 'processing',
        exercise_name: null,
        sets: null,
        suggestions: null,
        ai_parse_run: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (previousSession) {
        // Normal case: update existing cache (append to end for chronological order)
        queryClient.setQueryData<WorkoutSessionDetails>(
          queryKeys.sessions.detail(sessionId),
          {
            ...previousSession,
            session_events: [...(previousSession.session_events ?? []), optimisticEvent],
          }
        );
      } else {
        // Cache miss: this shouldn't happen if the screen is loaded, but log it for debugging
        console.warn('[useCreateEvent] Session not in cache, will add event on success');
      }

      return { previousSession, optimisticId };
    },
    onSuccess: async (newEvent, rawText, context) => {
      // Layer 2: Track this optimistic ID as resolved
      if (context?.optimisticId) {
        resolvedOptimisticIds.current.add(context.optimisticId);
      }

      // Layer 1: Cancel in-flight refetches to prevent overwrites
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.detail(sessionId) });

      // Replace the optimistic event with the real event from the API
      const currentSession = queryClient.getQueryData<WorkoutSessionDetails>(
        queryKeys.sessions.detail(sessionId)
      );

      if (currentSession) {
        // Remove both the optimistic event and any server copy that a race-condition
        // refetch (via structuralSharing) may have already inserted, then append the
        // canonical version once — this guarantees exactly one copy.
        const deduplicated = (currentSession.session_events ?? []).filter(
          (event) => event.id !== context?.optimisticId && event.id !== newEvent.id
        );

        queryClient.setQueryData<WorkoutSessionDetails>(
          queryKeys.sessions.detail(sessionId),
          {
            ...currentSession,
            session_events: [...deduplicated, newEvent],
          }
        );
      } else {
        // Session wasn't in cache - refetch to get everything
        queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
      }
    },
    onError: (err, rawText, context) => {
      // Roll back on error
      if (context?.previousSession) {
        queryClient.setQueryData(
          queryKeys.sessions.detail(sessionId),
          context.previousSession
        );
      }
    },
    // REMOVED onSettled - it causes race conditions by invalidating too soon
    // The polling mechanism in the logging screen handles ongoing updates
  });

  return { ...mutation, resolvedOptimisticIds };
}

/**
 * Hook to submit feedback (select suggestion) for an ambiguous event
 */
export function useSubmitFeedback(sessionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, selectedIndex, feedbackType = 'exercise' }: { eventId: number; selectedIndex: number; feedbackType?: 'exercise' | 'unit' | 'structure' | 'note' }) =>
      submitFeedback(sessionId, eventId, { selected_option_index: selectedIndex, feedback_type: feedbackType }),
    onSuccess: (updatedEvent) => {
      const session = queryClient.getQueryData<WorkoutSessionDetails>(
        queryKeys.sessions.detail(sessionId)
      );
      if (session) {
        queryClient.setQueryData<WorkoutSessionDetails>(
          queryKeys.sessions.detail(sessionId),
          {
            ...session,
            session_events: session.session_events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          }
        );
      }
    },
  });
}

/**
 * Hook to submit clarification response (provide missing value) for an event
 */
export function useSubmitClarification(sessionId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      field,
      value,
    }: {
      eventId: number;
      field: 'reps' | 'weight' | 'set_count';
      value: number;
    }) =>
      submitClarification(sessionId, eventId, {
        response_type: 'provide_value',
        provided_value: { [field]: value },
      }),
    onSuccess: (updatedEvent) => {
      const session = queryClient.getQueryData<WorkoutSessionDetails>(
        queryKeys.sessions.detail(sessionId)
      );
      if (session) {
        queryClient.setQueryData<WorkoutSessionDetails>(
          queryKeys.sessions.detail(sessionId),
          {
            ...session,
            session_events: session.session_events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          }
        );
      }
    },
  });
}
