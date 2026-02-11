import { apiClient } from './client';

export interface ReadinessSignal {
  type: 'sleep' | 'energy' | 'soreness' | 'stress';
  value: number;
}

export interface ReadinessBaseline {
  [signalType: string]: {
    mean: number;
    stddev: number;
    count: number;
  };
}

export async function submitReadiness(
  sessionId: number,
  signals: ReadinessSignal[],
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    `/sessions/${sessionId}/readiness`,
    { signals },
  );
  return response.data;
}

export async function skipReadiness(
  sessionId: number,
): Promise<{ message: string }> {
  const response = await apiClient.post<{ message: string }>(
    `/sessions/${sessionId}/readiness/skip`,
  );
  return response.data;
}

export async function getReadinessBaseline(
  sessionId: number,
): Promise<ReadinessBaseline> {
  const response = await apiClient.get<{ data: ReadinessBaseline }>(
    `/sessions/${sessionId}/readiness/baseline`,
  );
  return response.data.data;
}
