import { apiClient } from './client';
import type {
  OnboardingStatusResponse,
  OnboardingSubmitResponse,
  OnboardingSkipResponse,
  OnboardingCompleteResponse,
  OnboardingStepName,
} from './types';

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const response = await apiClient.get<{ data: OnboardingStatusResponse }>('/onboarding');
  return response.data.data;
}

export async function submitOnboardingStep(
  step: OnboardingStepName,
  rawText: string,
  locale?: string,
): Promise<OnboardingSubmitResponse> {
  const response = await apiClient.post<{ data: OnboardingSubmitResponse }>(
    `/onboarding/steps/${step}`,
    { raw_text: rawText, locale },
  );
  return response.data.data;
}

export async function skipOnboardingStep(
  step: OnboardingStepName,
): Promise<OnboardingSkipResponse> {
  const response = await apiClient.post<{ data: OnboardingSkipResponse }>(
    `/onboarding/steps/${step}/skip`,
  );
  return response.data.data;
}

export async function completeOnboarding(): Promise<OnboardingCompleteResponse> {
  const response = await apiClient.post<{ data: OnboardingCompleteResponse }>(
    '/onboarding/complete',
  );
  return response.data.data;
}
