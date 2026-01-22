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
  getCurrentSession,
  createAndStartSession,
} from './sessions';

// ============================================
// User
// ============================================
export {
  getUser,
  updateUser,
  updatePassword,
} from './user';
