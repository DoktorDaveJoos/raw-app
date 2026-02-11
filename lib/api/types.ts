import { z } from 'zod';

// ============================================
// User
// ============================================
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  email_verified_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  profile: z.object({
    id: z.number(),
    onboarding_completed_at: z.string().nullable(),
  }).nullable().optional(),
});

export type User = z.infer<typeof UserSchema>;

// ============================================
// Sets & Exercises
// ============================================
export const SetSchema = z.object({
  id: z.number().optional(),
  set_number: z.number(),
  weight_kg: z.number().nullable(),
  reps: z.number(),
  rpe: z.number().nullable(),
  rir: z.number().nullable(),
  unit: z.string().default('kg'),
  completed: z.boolean().optional().default(true),
});

export type Set = z.infer<typeof SetSchema>;

export const SessionExerciseSchema = z.object({
  id: z.number().optional(),
  exercise_id: z.number().optional(),
  exercise_name: z.string(),
  sets_count: z.number(),
  reps_count: z.number(),
  volume_kg: z.number().nullable(),
});

export type SessionExercise = z.infer<typeof SessionExerciseSchema>;

// ============================================
// AI Parse & Suggestions
// ============================================
export const SuggestionOptionSchema = z.object({
  exercise_name: z.string(),
  confidence: z.number().optional(),
  label: z.string().optional(),
  output_json: z.record(z.string(), z.unknown()).optional(),
});

export type SuggestionOption = z.infer<typeof SuggestionOptionSchema>;

export const SuggestionsSchema = z.object({
  options: z.array(SuggestionOptionSchema),
  selected_index: z.number().nullable(),
});

export type Suggestions = z.infer<typeof SuggestionsSchema>;

export const ClarificationSchema = z.object({
  type: z.enum(['ambiguity', 'missing_info', 'muscle_mapping']),
  message: z.string(),
  options: z.array(z.object({
    label: z.string(),
    payload: z.record(z.string(), z.unknown()),
  })).optional().default([]),
  missing_field: z.enum(['reps', 'weight', 'set_count']).nullable().optional(),
  partial_payload: z.record(z.string(), z.unknown()).nullable().optional(),
  exercise_id: z.number().optional(),
  exercise_name: z.string().optional(),
});

export type Clarification = z.infer<typeof ClarificationSchema>;

export const AiParseRunSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  error_message: z.string().nullable(),
});

export type AiParseRun = z.infer<typeof AiParseRunSchema>;

// ============================================
// Session Events
// ============================================
export const SymptomSchema = z.object({
  body_part: z.string(),
  symptom_type: z.string().optional(),
});

export type Symptom = z.infer<typeof SymptomSchema>;

export const ReadinessSchema = z.object({
  signal_type: z.string(),
  value_text: z.string().optional(),
  value_score: z.number().optional(),
});

export type Readiness = z.infer<typeof ReadinessSchema>;

export const NoteSchema = z.object({
  text: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;

export const SessionEventSchema = z.object({
  id: z.number(),
  type: z.string(), // Allow any string - action_type can be "unknown" or other values
  raw_text: z.string(),
  status: z.enum(['queued', 'processing', 'completed', 'failed', 'success', 'needs_clarification']),
  exercise_name: z.string().nullable(),
  sets: z.array(SetSchema).nullable(),
  suggestions: SuggestionsSchema.nullable().optional(),
  clarification: ClarificationSchema.nullable().optional(),
  ai_parse_run: AiParseRunSchema.nullable().optional(),
  symptom: SymptomSchema.nullable().optional(),
  readiness: ReadinessSchema.nullable().optional(),
  note: NoteSchema.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SessionEvent = z.infer<typeof SessionEventSchema>;

// ============================================
// Workout Sessions
// ============================================
export const WorkoutSessionStatusSchema = z.enum(['pending', 'in_progress', 'finished']);

export type WorkoutSessionStatus = z.infer<typeof WorkoutSessionStatusSchema>;

export const WorkoutSessionSummarySchema = z.object({
  id: z.number(),
  status: WorkoutSessionStatusSchema,
  workout_name: z.string().nullable(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  volume_kg: z.number().nullable(),
  exercises_count: z.number(),
  sets_count: z.number(),
  reps_count: z.number().optional(),
  duration_seconds: z.number().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type WorkoutSessionSummary = z.infer<typeof WorkoutSessionSummarySchema>;

export const WorkoutSessionDetailsSchema = WorkoutSessionSummarySchema.extend({
  session_events: z.array(SessionEventSchema),
  session_exercises: z.array(SessionExerciseSchema),
});

export type WorkoutSessionDetails = z.infer<typeof WorkoutSessionDetailsSchema>;

// ============================================
// Pagination
// ============================================
export const PaginationMetaSchema = z.object({
  current_page: z.number(),
  from: z.number().nullable(),
  last_page: z.number(),
  per_page: z.number(),
  to: z.number().nullable(),
  total: z.number(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export const PaginationLinksSchema = z.object({
  first: z.string().nullable(),
  last: z.string().nullable(),
  prev: z.string().nullable(),
  next: z.string().nullable(),
});

export type PaginationLinks = z.infer<typeof PaginationLinksSchema>;

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: PaginationMetaSchema.optional(),
    links: PaginationLinksSchema.optional(),
  });
}

export const PaginatedSessionsResponseSchema = createPaginatedResponseSchema(WorkoutSessionSummarySchema);

export type PaginatedSessionsResponse = z.infer<typeof PaginatedSessionsResponseSchema>;

// ============================================
// API Request/Response Types
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
  device_name: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  device_name: string;
}

export interface TwoFactorRequest {
  two_factor_token: string;
  code?: string;
  recovery_code?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  token_type: string;
}

export interface TwoFactorRequiredResponse {
  two_factor_required: true;
  two_factor_token: string;
  message: string;
}

export interface TokenResponse {
  token: string;
}

export interface CreateEventRequest {
  raw_text: string;
  locale?: string;
}

export interface UpdateEventRequest {
  raw_text?: string;
  exercise_name?: string;
  sets?: Partial<Set>[];
}

export interface FeedbackRequest {
  selected_option_index: number;
  feedback_type: 'exercise' | 'unit' | 'structure' | 'note';
}

export interface ClarificationRequest {
  response_type: 'select_option' | 'provide_value' | 'edit_text';
  selected_option_index?: number;
  provided_value?: { weight?: number; reps?: number; set_count?: number };
  edited_text?: string;
}

export interface SessionFilters {
  status?: WorkoutSessionStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// ============================================
// API Error
// ============================================
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ValidationError extends ApiError {
  errors: Record<string, string[]>;
}

// ============================================
// Onboarding
// ============================================
export type OnboardingStepName = 'welcome' | 'units' | 'training' | 'goals' | 'gear' | 'gear_followup' | 'equipment' | 'health' | 'health_followup';

export interface OnboardingStatusResponse {
  completed: boolean;
  current_step: OnboardingStepName | null;
  current_prompt: string | null;
  progress: {
    total: number;
    completed: number;
  };
  steps: Record<OnboardingStepName, {
    status: 'pending' | 'completed' | 'skipped';
    parsed_data: Record<string, unknown> | null;
  }>;
}

export interface OnboardingSubmitResponse {
  step: OnboardingStepName;
  parsed: Record<string, unknown>;
  confidence: number;
  next_step: OnboardingStepName | null;
  next_prompt: string | null;
}

export interface OnboardingSkipResponse {
  step: OnboardingStepName;
  skipped: boolean;
  next_step: OnboardingStepName | null;
  next_prompt: string | null;
}

export interface OnboardingCompleteResponse {
  message: string;
  profile: Record<string, unknown>;
}

// ============================================
// Muscle Groups
// ============================================
export const MuscleGroupSchema = z.object({
  key: z.string(),
  name: z.string(),
  category: z.enum(['push', 'pull', 'arms', 'legs', 'core']),
  sort_order: z.number(),
});

export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;

export interface MuscleMappingEntry {
  muscle_group_key: string;
  contribution: 0.5 | 1.0; // Secondary | Primary
}

export interface SubmitMuscleMappingRequest {
  exercise_id: number;
  mappings: MuscleMappingEntry[];
}

export interface UpdateExerciseMuscleMappingRequest {
  mappings: MuscleMappingEntry[];
}
