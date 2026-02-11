import type { Profile } from '@/lib/api';

// ============================================
// Option Types
// ============================================
interface IconOption {
  label: string;
  value: string;
  icon: string;
}

interface LabelOption {
  label: string;
  value: string;
}

// ============================================
// Basics
// ============================================
export const UNIT_OPTIONS: IconOption[] = [
  { label: 'Kilograms (KG)', value: 'kg', icon: 'fitness-center' },
  { label: 'Pounds (LB)', value: 'lb', icon: 'fitness-center' },
];

// ============================================
// Training
// ============================================
export const SPLIT_OPTIONS: IconOption[] = [
  { label: 'Push/Pull/Legs', value: 'ppl', icon: 'view-column' },
  { label: 'Upper/Lower', value: 'upper_lower', icon: 'swap-vert' },
  { label: 'Full Body', value: 'full_body', icon: 'accessibility-new' },
  { label: 'Bro Split', value: 'bro_split', icon: 'calendar-today' },
  { label: 'Other', value: 'other', icon: 'tune' },
];

export const EXPERIENCE_OPTIONS: IconOption[] = [
  { label: 'Beginner', value: 'beginner', icon: 'star-outline' },
  { label: 'Intermediate', value: 'intermediate', icon: 'star-half' },
  { label: 'Advanced', value: 'advanced', icon: 'star' },
  { label: 'Elite', value: 'elite', icon: 'emoji-events' },
];

// ============================================
// Goals
// ============================================
export const GOAL_OPTIONS: IconOption[] = [
  { label: 'Strength', value: 'strength', icon: 'fitness-center' },
  { label: 'Hypertrophy', value: 'hypertrophy', icon: 'trending-up' },
  { label: 'General Fitness', value: 'general_fitness', icon: 'favorite' },
  { label: 'Powerlifting', value: 'powerlifting', icon: 'flash-on' },
  { label: 'Bodybuilding', value: 'bodybuilding', icon: 'emoji-events' },
];

export const MUSCLE_GROUPS: LabelOption[] = [
  { label: 'Chest', value: 'chest' },
  { label: 'Back', value: 'back' },
  { label: 'Quadriceps', value: 'quadriceps' },
  { label: 'Hamstrings', value: 'hamstrings' },
  { label: 'Glutes', value: 'glutes' },
  { label: 'Front Delts', value: 'front_delts' },
  { label: 'Side Delts', value: 'side_delts' },
  { label: 'Rear Delts', value: 'rear_delts' },
  { label: 'Biceps', value: 'biceps' },
  { label: 'Triceps', value: 'triceps' },
  { label: 'Calves', value: 'calves' },
  { label: 'Abs', value: 'abs' },
  { label: 'Forearms', value: 'forearms' },
];

// ============================================
// Gear
// ============================================
export const COMMON_SUPPLEMENTS: LabelOption[] = [
  { label: 'Creatine', value: 'creatine' },
  { label: 'Protein', value: 'protein' },
  { label: 'Pre-workout', value: 'pre-workout' },
  { label: 'Fish Oil', value: 'fish_oil' },
  { label: 'Vitamin D', value: 'vitamin_d' },
  { label: 'Multivitamin', value: 'multivitamin' },
  { label: 'Caffeine', value: 'caffeine' },
  { label: 'BCAAs', value: 'bcaas' },
  { label: 'Magnesium', value: 'magnesium' },
  { label: 'Zinc', value: 'zinc' },
];

// ============================================
// Equipment
// ============================================
export const GYM_TYPE_OPTIONS: IconOption[] = [
  { label: 'Commercial', value: 'commercial', icon: 'store' },
  { label: 'Home Gym', value: 'home', icon: 'home' },
  { label: 'Garage Gym', value: 'garage', icon: 'garage' },
  { label: 'Outdoor', value: 'outdoor', icon: 'park' },
];

export const COMMON_EQUIPMENT: LabelOption[] = [
  { label: 'Barbell', value: 'barbell' },
  { label: 'Dumbbells', value: 'dumbbells' },
  { label: 'Cables', value: 'cables' },
  { label: 'Smith Machine', value: 'smith_machine' },
  { label: 'Pull-up Bar', value: 'pull_up_bar' },
  { label: 'Dip Station', value: 'dip_station' },
  { label: 'Leg Press', value: 'leg_press' },
  { label: 'Hack Squat', value: 'hack_squat' },
  { label: 'Lat Pulldown', value: 'lat_pulldown' },
  { label: 'Seated Row', value: 'seated_row' },
  { label: 'Pec Deck', value: 'pec_deck' },
  { label: 'Resistance Bands', value: 'resistance_bands' },
  { label: 'Kettlebells', value: 'kettlebells' },
];

// ============================================
// Health
// ============================================
export const COMMON_MOVEMENTS_TO_AVOID: LabelOption[] = [
  { label: 'Behind Neck Press', value: 'behind_neck_press' },
  { label: 'Upright Rows', value: 'upright_rows' },
  { label: 'Barbell Skull Crushers', value: 'barbell_skull_crushers' },
  { label: 'Leg Extensions', value: 'leg_extensions' },
  { label: 'Good Mornings', value: 'good_mornings' },
  { label: 'Conventional Deadlift', value: 'conventional_deadlift' },
  { label: 'Back Squat', value: 'back_squat' },
  { label: 'Flat Bench Press', value: 'flat_bench_press' },
];

// ============================================
// Label Maps
// ============================================
const SPLIT_LABELS: Record<string, string> = {
  ppl: 'PPL',
  upper_lower: 'Upper/Lower',
  full_body: 'Full Body',
  bro_split: 'Bro Split',
  other: 'Other',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};

const GOAL_LABELS: Record<string, string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  general_fitness: 'General Fitness',
  powerlifting: 'Powerlifting',
  bodybuilding: 'Bodybuilding',
};

const GYM_TYPE_LABELS: Record<string, string> = {
  commercial: 'Commercial',
  home: 'Home Gym',
  garage: 'Garage Gym',
  outdoor: 'Outdoor',
};

const MUSCLE_GROUP_LABELS: Record<string, string> = Object.fromEntries(
  MUSCLE_GROUPS.map((m) => [m.value, m.label])
);

const EQUIPMENT_LABELS: Record<string, string> = Object.fromEntries(
  COMMON_EQUIPMENT.map((e) => [e.value, e.label])
);

const SUPPLEMENT_LABELS: Record<string, string> = Object.fromEntries(
  COMMON_SUPPLEMENTS.map((s) => [s.value, s.label])
);

// ============================================
// Summary Builders
// ============================================
function labelOrTitleCase(value: string | null | undefined, labels: Record<string, string>): string {
  if (!value) return '';
  return labels[value] || value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getBasicsSummary(p: Profile): string {
  const parts: string[] = [];
  if (p.unit_preference) parts.push(p.unit_preference.toUpperCase());
  if (p.age) parts.push(`${p.age} years old`);
  if (p.height) parts.push(`${p.height}cm`);
  if (p.body_weight) {
    const unit = p.unit_preference || 'kg';
    parts.push(`${p.body_weight}${unit}`);
  }
  return parts.join(' · ') || 'Not set';
}

export function getTrainingSummary(p: Profile): string {
  const parts: string[] = [];
  if (p.current_split) parts.push(labelOrTitleCase(p.current_split, SPLIT_LABELS));
  if (p.training_frequency) parts.push(`${p.training_frequency}x/week`);
  if (p.experience_level) parts.push(labelOrTitleCase(p.experience_level, EXPERIENCE_LABELS));
  return parts.join(' · ') || 'Not set';
}

export function getGoalsSummary(p: Profile): string {
  const parts: string[] = [];
  if (p.primary_goal) parts.push(labelOrTitleCase(p.primary_goal, GOAL_LABELS));
  if (p.target_muscle_groups?.length) {
    const labels = p.target_muscle_groups
      .slice(0, 3)
      .map((m) => labelOrTitleCase(m, MUSCLE_GROUP_LABELS));
    const suffix = p.target_muscle_groups.length > 3
      ? ` +${p.target_muscle_groups.length - 3}`
      : '';
    parts.push(`Focus: ${labels.join(', ')}${suffix}`);
  }
  return parts.join(' · ') || 'Not set';
}

export function getGearSummary(p: Profile): string {
  const parts: string[] = [];
  parts.push(p.is_enhanced ? 'Enhanced' : 'Natural');
  if (p.supplements?.length) {
    const labels = p.supplements
      .slice(0, 3)
      .map((s) => labelOrTitleCase(s, SUPPLEMENT_LABELS));
    const suffix = p.supplements.length > 3
      ? ` +${p.supplements.length - 3}`
      : '';
    parts.push(`${labels.join(', ')}${suffix}`);
  }
  return parts.join(' · ');
}

export function getEquipmentSummary(p: Profile): string {
  const parts: string[] = [];
  if (p.gym_type) parts.push(labelOrTitleCase(p.gym_type, GYM_TYPE_LABELS));
  if (p.available_equipment?.length) {
    const labels = p.available_equipment
      .slice(0, 3)
      .map((e) => labelOrTitleCase(e, EQUIPMENT_LABELS));
    const suffix = p.available_equipment.length > 3
      ? ` +${p.available_equipment.length - 3}`
      : '';
    parts.push(`${labels.join(', ')}${suffix}`);
  }
  return parts.join(' · ') || 'Not set';
}

export function getHealthSummary(p: Profile): string {
  const parts: string[] = [];
  if (p.injuries?.length) {
    parts.push(`${p.injuries.length} ${p.injuries.length === 1 ? 'injury' : 'injuries'}`);
  } else {
    parts.push('No injuries');
  }
  if (p.movements_to_avoid?.length) {
    parts.push(`${p.movements_to_avoid.length} avoided`);
  }
  return parts.join(' · ');
}
