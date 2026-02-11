import { apiClient } from './client';
import { MuscleGroup, MuscleGroupSchema } from './types';
import { z } from 'zod';

/**
 * Get all muscle groups organized by category
 */
export async function getMuscleGroups(): Promise<MuscleGroup[]> {
  const response = await apiClient.get<{ data: unknown[] }>('/muscle-groups');
  return z.array(MuscleGroupSchema).parse(response.data.data);
}
