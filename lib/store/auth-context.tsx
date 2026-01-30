import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getUser,
  getToken,
  clearToken,
  setAuthErrorHandler,
} from '../api';
import type { User } from '../api';
import type { LoginResult } from '../api';

// ============================================
// Types
// ============================================
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export type SignInResult =
  | { success: true }
  | { success: false; twoFactorRequired: true; twoFactorToken: string };

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ============================================
// Context
// ============================================
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================
// Provider
// ============================================
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for existing auth on mount
  const checkAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const token = await getToken();
      if (!token) {
        setState({
          token: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Token exists, try to fetch user
      const user = await getUser();
      setState({
        token,
        user,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      // Token invalid or expired
      await clearToken();
      setState({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await apiLogin({ email, password });

      if (!result.success) {
        // 2FA required - don't update auth state yet
        setState((prev) => ({ ...prev, isLoading: false }));
        return {
          success: false,
          twoFactorRequired: true,
          twoFactorToken: result.twoFactorToken,
        };
      }

      // Successful login
      setState({
        token: result.token,
        user: result.user,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await apiLogout();
    } catch (error) {
      // Continue with local logout even if API call fails
      console.warn('Logout API call failed:', error);
    }

    setState({
      token: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Set up auth error handler for automatic logout on 401/403
  useEffect(() => {
    setAuthErrorHandler(() => {
      setState({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    });
    return () => setAuthErrorHandler(null);
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Hook
// ============================================
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================
// Utility Hooks
// ============================================
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

export function useAuthLoading(): boolean {
  const { isLoading } = useAuth();
  return isLoading;
}
