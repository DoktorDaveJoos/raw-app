import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getOnboardingStatus,
  submitOnboardingStep,
  skipOnboardingStep,
  completeOnboarding,
} from '@/lib/api';
import { queryKeys, invalidateOnboarding, invalidateUser } from '@/lib/store';
import type { OnboardingStepName } from '@/lib/api';

export function useOnboardingStatus() {
  return useQuery({
    queryKey: queryKeys.onboarding.status,
    queryFn: getOnboardingStatus,
  });
}

export function useSubmitOnboardingStep() {
  return useMutation({
    mutationFn: ({ step, rawText, locale }: { step: OnboardingStepName; rawText: string; locale?: string }) =>
      submitOnboardingStep(step, rawText, locale),
    onSuccess: () => {
      invalidateOnboarding();
    },
  });
}

export function useSkipOnboardingStep() {
  return useMutation({
    mutationFn: (step: OnboardingStepName) => skipOnboardingStep(step),
    onSuccess: () => {
      invalidateOnboarding();
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => {
      invalidateOnboarding();
      invalidateUser();
    },
  });
}
