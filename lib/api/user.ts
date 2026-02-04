import { apiClient } from './client';
import type { User } from './types';

// ============================================
// User API Functions
// ============================================

/**
 * Get the currently authenticated user
 */
export async function getUser(): Promise<User> {
  const response = await apiClient.get<User>('/user');
  return response.data;
}

/**
 * Update user profile
 */
export async function updateUser(data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
  const response = await apiClient.put<User>('/user/profile-information', data);
  return response.data;
}

/**
 * Update user password
 */
export async function updatePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiClient.put('/user/password', data);
}
