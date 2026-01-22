import { apiClient, setToken, clearToken, getToken } from './client';
import type {
  LoginRequest,
  RegisterRequest,
  TwoFactorRequest,
  AuthResponse,
  TwoFactorRequiredResponse,
  User,
} from './types';

// ============================================
// Auth API Functions
// ============================================

export type LoginResult =
  | { success: true; user: User; token: string }
  | { success: false; twoFactorRequired: true; twoFactorToken: string };

/**
 * Login with email and password using mobile API route
 * Returns either auth response or two-factor required response
 */
export async function login(
  credentials: Omit<LoginRequest, 'device_name'>
): Promise<LoginResult> {
  const response = await apiClient.post<AuthResponse | TwoFactorRequiredResponse>(
    '/auth/login',
    {
      ...credentials,
      device_name: 'mobile_app',
    }
  );

  // Check if 2FA is required
  if ('two_factor_required' in response.data && response.data.two_factor_required) {
    return {
      success: false,
      twoFactorRequired: true,
      twoFactorToken: response.data.two_factor_token,
    };
  }

  // Successful login
  const authResponse = response.data as AuthResponse;
  await setToken(authResponse.token);

  return {
    success: true,
    user: authResponse.user,
    token: authResponse.token,
  };
}

/**
 * Register a new user using mobile API route
 */
export async function register(
  data: Omit<RegisterRequest, 'device_name'>
): Promise<{ user: User; token: string }> {
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    ...data,
    device_name: 'mobile_app',
  });

  await setToken(response.data.token);

  return {
    user: response.data.user,
    token: response.data.token,
  };
}

/**
 * Submit two-factor authentication code using mobile API route
 */
export async function twoFactorChallenge(
  data: TwoFactorRequest
): Promise<{ user: User; token: string }> {
  const response = await apiClient.post<AuthResponse>(
    '/auth/two-factor/challenge',
    data
  );

  await setToken(response.data.token);

  return {
    user: response.data.user,
    token: response.data.token,
  };
}

/**
 * Logout and clear token
 */
export async function logout(): Promise<void> {
  try {
    // Revoke the token on the server
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Continue with local logout even if server request fails
    console.warn('Logout request failed, clearing local token anyway');
  }

  await clearToken();
}

/**
 * Check if user is authenticated (has a stored token)
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

/**
 * Get the stored token
 */
export { getToken, setToken, clearToken } from './client';
