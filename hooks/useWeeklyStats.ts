import { useQuery } from '@tanstack/react-query';
import { getSessions } from '@/lib/api';
import { queryKeys } from '@/lib/store';
import type { WorkoutSessionSummary } from '@/lib/api';

export interface WeeklyStats {
  volume: number;
  workouts: number;
  workoutsTarget: number;
  avgIntensity: number;
  sessions: WorkoutSessionSummary[];
}

/**
 * Calculate weekly stats from sessions
 */
function calculateWeeklyStats(sessions: WorkoutSessionSummary[]): WeeklyStats {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter sessions from the last 7 days that are finished
  const weeklySessions = sessions.filter((session) => {
    if (session.status !== 'finished' || !session.finished_at) return false;
    const finishedAt = new Date(session.finished_at);
    return finishedAt >= weekAgo;
  });

  // Calculate total volume
  const volume = weeklySessions.reduce((sum, s) => sum + (s.volume_kg || 0), 0);

  // Count workouts
  const workouts = weeklySessions.length;

  // Default target (could be user preference later)
  const workoutsTarget = 5;

  // Average intensity - requires RPE data from events (not yet available)
  const avgIntensity = 0;

  return {
    volume,
    workouts,
    workoutsTarget,
    avgIntensity,
    sessions: weeklySessions,
  };
}

/**
 * Hook to fetch and calculate weekly stats
 */
export function useWeeklyStats() {
  return useQuery({
    queryKey: queryKeys.weeklyStats,
    queryFn: async () => {
      // Fetch recent sessions (last 30 days to ensure we have enough data)
      const response = await getSessions({ status: 'finished', per_page: 50 });
      return calculateWeeklyStats(response.data);
    },
    // Refresh every 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
