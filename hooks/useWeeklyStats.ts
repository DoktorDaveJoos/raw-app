import { useQuery } from '@tanstack/react-query';
import { getWeeklyStats } from '@/lib/api';
import { queryKeys } from '@/lib/store';

export interface WeeklyStats {
  volume: number;
  workouts: number;
  workoutsTarget: number;
  avgIntensity: number;
  totalTimeHours: number;
}

/**
 * Hook to fetch weekly stats from the API
 */
export function useWeeklyStats() {
  return useQuery({
    queryKey: queryKeys.weeklyStats,
    queryFn: async (): Promise<WeeklyStats> => {
      const data = await getWeeklyStats();
      return {
        volume: data.volume_kg,
        workouts: data.workouts_count,
        workoutsTarget: 5,
        avgIntensity: data.avg_rpe,
        totalTimeHours: data.duration_hours,
      };
    },
    // Refresh every 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
