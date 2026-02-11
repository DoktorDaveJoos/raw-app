// ============================================
// Types
// ============================================
export * from './types';

// ============================================
// Client
// ============================================
export {
  apiClient,
  getToken,
  setToken,
  clearToken,
  setAuthErrorHandler,
  isAxiosError,
  getErrorMessage,
  getValidationErrors,
} from './client';

// ============================================
// Auth
// ============================================
export {
  login,
  register,
  twoFactorChallenge,
  logout,
  isAuthenticated,
} from './auth';
export type { LoginResult } from './auth';

// ============================================
// Sessions
// ============================================
export {
  getSessions,
  getSession,
  createSession,
  startSession,
  finishSession,
  deleteSession,
  createEvent,
  updateEvent,
  deleteEvent,
  submitFeedback,
  submitClarification,
  getCurrentSession,
  createAndStartSession,
  getWeeklyStats,
  submitMuscleMapping,
  skipMuscleMapping,
} from './sessions';

// ============================================
// User
// ============================================
export {
  getUser,
  updateUser,
  updatePassword,
} from './user';

// ============================================
// Profile
// ============================================
export {
  getProfile,
  updateProfile,
} from './profile';
export type { Profile, ProfileUpdate, Compound, Injury } from './profile';

// ============================================
// Readiness
// ============================================
export {
  submitReadiness,
  skipReadiness,
  getReadinessBaseline,
} from './readiness';
export type { ReadinessSignal, ReadinessBaseline } from './readiness';

// ============================================
// Onboarding
// ============================================
export {
  getOnboardingStatus,
  submitOnboardingStep,
  skipOnboardingStep,
  completeOnboarding,
} from './onboarding';

// ============================================
// Muscle Groups
// ============================================
export { getMuscleGroups } from './muscle-groups';

// ============================================
// Start Page
// ============================================
export { getStartPage } from './start-page';
export type {
  StartPageGreeting,
  StartPageStatsCurrent,
  StartPageStatsChanges,
  StartPageStats,
  StartPageE1rm,
  StartPageInsight,
  VolumeLandmark,
  StartPageData,
} from './start-page';
