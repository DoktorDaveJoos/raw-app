import { apiClient } from './client';

// ============================================
// Types
// ============================================

export interface StartPageGreeting {
  first_name: string;
  date_label: string;
  window_label: string;
}

export interface StartPageStatsCurrent {
  volume_kg: number;
  workouts_count: number;
  duration_seconds: number;
  avg_rpe: number | null;
}

export interface StartPageStatsChanges {
  volume_change_percent: number | null;
  workouts_change: number;
  duration_change_seconds: number;
}

export interface StartPageStats {
  current: StartPageStatsCurrent;
  changes: StartPageStatsChanges;
}

export interface StartPageE1rm {
  key: string;
  exercise_name: string;
  exercise_id: number | null;
  estimated_1rm: number | null;
  unit: string | null;
  change: number | null;
  has_data: boolean;
}

export interface StartPageInsight {
  state: 'active' | 'none' | 'empty';
  text: string | null;
  suggestion_ids: number[];
  updated_at: string | null;
}

export interface VolumeLandmark {
  muscle_group_key: string;
  muscle_group_name: string;
  category: string;
  current_sets: number;
  mev_sets: number;
  mav_low_sets: number;
  mav_high_sets: number;
  mrv_sets: number;
  zone: 'none' | 'below_mev' | 'in_mav' | 'above_mav' | 'above_mrv';
  is_locked: boolean;
}

export interface StartPageData {
  greeting: StartPageGreeting;
  stats: StartPageStats;
  e1rm: StartPageE1rm[];
  insight: StartPageInsight;
  volume_landmarks: VolumeLandmark[];
}

// ============================================
// API
// ============================================

export async function getStartPage(): Promise<StartPageData> {
  const response = await apiClient.get<{ data: StartPageData }>('/start-page');
  return response.data.data;
}
