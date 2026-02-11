import { useQuery } from '@tanstack/react-query';
import { getStartPage } from '@/lib/api';
import { queryKeys, useAuth } from '@/lib/store';

export function useStartPage() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.startPage,
    queryFn: getStartPage,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
