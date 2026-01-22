import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

// ============================================
// Token Storage
// ============================================
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    // Use localStorage on web
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ============================================
// API Client
// ============================================
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://raw.test';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// ============================================
// Request Interceptor - Add Auth Token
// ============================================
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor - Handle Errors
// ============================================
export type AuthErrorHandler = () => void;

let onAuthError: AuthErrorHandler | null = null;

export function setAuthErrorHandler(handler: AuthErrorHandler) {
  onAuthError = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // Handle 401 Unauthorized or 403 Forbidden
      if (status === 401 || status === 403) {
        await clearToken();
        if (onAuthError) {
          onAuthError();
        }
      }

      // Handle 422 Validation errors
      if (status === 422) {
        // The error.response.data will contain validation errors
        // Let the caller handle these
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Helper to check if error is API error
// ============================================
export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error);
}

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (isAxiosError(error) && error.response?.status === 422) {
    const data = error.response.data as { errors?: Record<string, string[]> } | undefined;
    return data?.errors || null;
  }
  return null;
}
