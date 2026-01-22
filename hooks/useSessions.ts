import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions,
  getSession,
  createSession,
  startSession,
  finishSession,
  createAndStartSession,
  createEvent,
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
 */
export function useSession(sessionId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.sessions.detail(sessionId!),
    queryFn: () => getSession(sessionId!),
    enabled: !!sessionId,
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

  return useMutation({
    mutationFn: (rawText: string) => createEvent(sessionId, { raw_text: rawText }),
    onMutate: async (rawText) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.detail(sessionId) });

      // Snapshot the previous value
      const previousSession = queryClient.getQueryData<WorkoutSessionDetails>(
        queryKeys.sessions.detail(sessionId)
      );

      // Optimistically add a processing event
      if (previousSession) {
        const optimisticEvent: SessionEvent = {
          id: -Date.now(), // Temporary negative ID
          type: 'add_sets',
          raw_text: rawText,
          status: 'processing',
          exercise_name: null,
          sets: null,
          suggestions: null,
          ai_parse_run: null,
          created_at: undefined,
          updated_at: undefined,
        };

        queryClient.setQueryData<WorkoutSessionDetails>(
          queryKeys.sessions.detail(sessionId),
          {
            ...previousSession,
            session_events: [optimisticEvent, ...(previousSession.session_events ?? [])],
          }
        );
      }

      return { previousSession };
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
    onSettled: () => {
      // Refetch to get the real data
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
    },
  });
}
