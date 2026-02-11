import { useQuery, useMutation } from '@tanstack/react-query';
import { submitReadiness, skipReadiness, getReadinessBaseline } from '@/lib/api';
import type { ReadinessSignal } from '@/lib/api';

export function useSubmitReadiness(sessionId: number) {
  return useMutation({
    mutationFn: (signals: ReadinessSignal[]) => submitReadiness(sessionId, signals),
  });
}

export function useSkipReadiness(sessionId: number) {
  return useMutation({
    mutationFn: () => skipReadiness(sessionId),
  });
}

export function useReadinessBaseline(sessionId: number) {
  return useQuery({
    queryKey: ['readiness', 'baseline', sessionId],
    queryFn: () => getReadinessBaseline(sessionId),
    enabled: !!sessionId,
  });
}
