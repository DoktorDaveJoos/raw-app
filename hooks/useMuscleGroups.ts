import { useQuery } from '@tanstack/react-query';
import { getMuscleGroups } from '@/lib/api';
import { useAuth } from '@/lib/store';

export const queryKeys = {
  muscleGroups: ['muscleGroups'] as const,
};

/**
 * Hook to fetch muscle groups
 * Muscle groups are static data, so we cache them indefinitely
 */
export function useMuscleGroups() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.muscleGroups,
    queryFn: getMuscleGroups,
    enabled: isAuthenticated,
    staleTime: Infinity, // Muscle groups never change
  });
}
