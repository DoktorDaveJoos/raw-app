import { z } from 'zod';
import { apiClient } from './client';

// ============================================
// Schemas
// ============================================
const CompoundSchema = z.object({
  name: z.string(),
  dose: z.string().nullable().optional(),
  frequency: z.string().nullable().optional(),
});

const InjurySchema = z.object({
  body_part: z.string(),
  side: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const ProfileSchema = z.object({
  age: z.number().nullable().optional(),
  gender: z.string().nullable().optional(),
  body_weight: z.coerce.number().nullable().optional(),
  height: z.coerce.number().nullable().optional(),
  unit_preference: z.string().nullable().optional(),
  training_years: z.coerce.number().nullable().optional(),
  experience_level: z.string().nullable().optional(),
  training_frequency: z.number().nullable().optional(),
  current_split: z.string().nullable().optional(),
  primary_goal: z.string().nullable().optional(),
  target_muscle_groups: z.array(z.string()).nullable().optional(),
  is_enhanced: z.boolean().nullable().optional(),
  compounds: z.array(CompoundSchema).nullable().optional(),
  supplements: z.array(z.string()).nullable().optional(),
  gym_type: z.string().nullable().optional(),
  available_equipment: z.array(z.string()).nullable().optional(),
  injuries: z.array(InjurySchema).nullable().optional(),
  movements_to_avoid: z.array(z.string()).nullable().optional(),
});

// ============================================
// Types
// ============================================
export type Profile = z.infer<typeof ProfileSchema>;
export type ProfileUpdate = Partial<Profile>;
export type Compound = z.infer<typeof CompoundSchema>;
export type Injury = z.infer<typeof InjurySchema>;

// ============================================
// API Functions
// ============================================
export async function getProfile(): Promise<Profile> {
  const response = await apiClient.get<{ data: Profile }>('/me/profile');
  return ProfileSchema.parse(response.data.data);
}

export async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  const response = await apiClient.patch<{ data: Profile }>('/me/profile', data);
  return ProfileSchema.parse(response.data.data);
}
