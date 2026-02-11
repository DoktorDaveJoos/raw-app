import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ============================================
// Query Client Configuration
// ============================================
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 30 seconds
      staleTime: 30 * 1000,
      // Cache time: 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

// ============================================
// Query Keys
// ============================================
export const queryKeys = {
  // User
  user: ['user'] as const,

  // Sessions
  sessions: {
    all: ['sessions'] as const,
    list: (filters?: Record<string, unknown>) => ['sessions', 'list', filters] as const,
    detail: (id: number) => ['sessions', 'detail', id] as const,
    current: ['sessions', 'current'] as const,
  },

  // Weekly stats (derived from sessions)
  weeklyStats: ['weeklyStats'] as const,

  // Profile
  profile: ['profile'] as const,

  // Onboarding
  onboarding: {
    status: ['onboarding', 'status'] as const,
  },
} as const;

// ============================================
// Provider
// ============================================
interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// ============================================
// Cache Utilities
// ============================================

/**
 * Invalidate all session-related queries
 */
export function invalidateSessions() {
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
}

/**
 * Invalidate a specific session
 */
export function invalidateSession(sessionId: number) {
  queryClient.invalidateQueries({ queryKey: queryKeys.sessions.detail(sessionId) });
}

/**
 * Invalidate user data
 */
export function invalidateUser() {
  queryClient.invalidateQueries({ queryKey: queryKeys.user });
}

/**
 * Invalidate onboarding status
 */
export function invalidateOnboarding() {
  queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.status });
}

/**
 * Invalidate profile data
 */
export function invalidateProfile() {
  queryClient.invalidateQueries({ queryKey: queryKeys.profile });
}

/**
 * Clear all cached data (useful on logout)
 */
export function clearQueryCache() {
  queryClient.clear();
}
