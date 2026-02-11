import { useQuery, useMutation } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/api';
import type { Profile, ProfileUpdate } from '@/lib/api';
import { queryKeys, queryClient, useAuth } from '@/lib/store';

export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: (data: ProfileUpdate) => updateProfile(data),
    onSuccess: (updatedProfile: Profile) => {
      queryClient.setQueryData(queryKeys.profile, updatedProfile);
    },
  });
}
