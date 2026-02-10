import type { OnboardingStepName } from '@/lib/api';

export interface ChipOption {
  label: string;
  value: string;
}

export interface CardOption {
  label: string;
  value: string;
  icon: string; // MaterialIcons name
}

export interface StepConfig {
  placeholder: string;
  chipOptions?: ChipOption[];
  cardOptions?: CardOption[];
  multiSelectChips?: ChipOption[];
  sectionLabels?: string[];
  buildText: (selections: { cards?: string[]; chips?: string[]; multiSelect?: string[] }) => string;
}

export const STEP_ORDER: OnboardingStepName[] = [
  'welcome',
  'units',
  'training',
  'goals',
  'gear',
  'gear_followup',
  'equipment',
  'health',
  'health_followup',
];

const DISPLAY_STEP_MAP: Record<OnboardingStepName, number> = {
  welcome: 1, units: 2, training: 3, goals: 4,
  gear: 5, gear_followup: 5,
  equipment: 6,
  health: 7, health_followup: 7,
};

export const VISIBLE_TOTAL_STEPS = 7;

export function getDisplayStepNumber(step: OnboardingStepName): number {
  return DISPLAY_STEP_MAP[step];
}

export function getStepNumber(step: OnboardingStepName): number {
  return STEP_ORDER.indexOf(step) + 1;
}

export const HEALTH_FOLLOWUP_OPTIONS: Record<string, CardOption[]> = {
  shoulder: [
    { label: 'Rotator cuff injury', value: 'rotator_cuff', icon: 'radio-button-unchecked' },
    { label: 'Impingement / bursitis', value: 'impingement', icon: 'radio-button-unchecked' },
    { label: 'General pain / stiffness', value: 'general_pain', icon: 'radio-button-unchecked' },
    { label: 'Post-surgery recovery', value: 'post_surgery', icon: 'radio-button-unchecked' },
  ],
  knee: [
    { label: 'Meniscus injury', value: 'meniscus', icon: 'radio-button-unchecked' },
    { label: 'Ligament injury (ACL/MCL)', value: 'ligament', icon: 'radio-button-unchecked' },
    { label: 'Patella issues', value: 'patella', icon: 'radio-button-unchecked' },
    { label: 'General pain / stiffness', value: 'general_pain', icon: 'radio-button-unchecked' },
  ],
  lower_back: [
    { label: 'Herniated disc', value: 'herniated_disc', icon: 'radio-button-unchecked' },
    { label: 'Sciatica', value: 'sciatica', icon: 'radio-button-unchecked' },
    { label: 'Muscle strain', value: 'muscle_strain', icon: 'radio-button-unchecked' },
    { label: 'General pain / stiffness', value: 'general_pain', icon: 'radio-button-unchecked' },
  ],
};

export const HEALTH_FOLLOWUP_PLACEHOLDERS: Record<string, string> = {
  shoulder: 'Describe your shoulder issue...',
  knee: 'Describe your knee issue...',
  lower_back: 'Describe your lower back issue...',
};

export const STEP_CONFIGS: Record<OnboardingStepName, StepConfig> = {
  welcome: {
    placeholder: 'e.g. 28, male, 82kg, 180cm',
    buildText: () => '', // No chips - pure text input
  },

  units: {
    placeholder: 'Or type your preference...',
    chipOptions: [
      { label: 'Kilograms (kg)', value: 'kg' },
      { label: 'Pounds (lb)', value: 'lb' },
    ],
    buildText: ({ chips }) => {
      if (chips?.length) {
        return `I prefer ${chips[0] === 'kg' ? 'kilograms' : 'pounds'}`;
      }
      return '';
    },
  },

  training: {
    placeholder: 'e.g. 5 years, 4x per week',
    chipOptions: [
      { label: 'PPL', value: 'PPL' },
      { label: 'Upper/Lower', value: 'Upper/Lower' },
      { label: 'Full Body', value: 'Full Body' },
    ],
    buildText: ({ chips }) => {
      if (chips?.length) {
        return `I follow a ${chips[0]} split`;
      }
      return '';
    },
  },

  goals: {
    placeholder: 'Or type your goals...',
    cardOptions: [
      { label: 'Strength', value: 'strength', icon: 'fitness-center' },
      { label: 'Hypertrophy', value: 'hypertrophy', icon: 'track-changes' },
      { label: 'General Fitness', value: 'general_fitness', icon: 'favorite' },
      { label: 'Powerlifting', value: 'powerlifting', icon: 'emoji-events' },
    ],
    multiSelectChips: [
      { label: 'Chest', value: 'chest' },
      { label: 'Back', value: 'back' },
      { label: 'Arms', value: 'arms' },
      { label: 'Legs', value: 'legs' },
    ],
    sectionLabels: ['SELECT YOUR PRIMARY GOAL', 'FOCUS AREAS (OPTIONAL)'],
    buildText: ({ cards, multiSelect }) => {
      const parts: string[] = [];
      if (cards?.length) {
        parts.push(`My primary goal is ${cards[0]}`);
      }
      if (multiSelect?.length) {
        parts.push(`I want to focus on ${multiSelect.join(', ')}`);
      }
      return parts.join('. ');
    },
  },

  gear: {
    placeholder: 'Or describe your stack...',
    cardOptions: [
      { label: 'Natural / Natty', value: 'natural', icon: 'eco' },
      { label: 'Enhanced / Using PEDs', value: 'enhanced', icon: 'medication' },
      { label: 'Prefer not to say', value: 'prefer_not_to_say', icon: 'visibility-off' },
    ],
    multiSelectChips: [
      { label: 'Creatine', value: 'creatine' },
      { label: 'Protein', value: 'protein' },
      { label: 'Pre-workout', value: 'pre-workout' },
    ],
    sectionLabels: ['', 'SUPPLEMENTS (OPTIONAL)'],
    buildText: ({ cards, multiSelect }) => {
      const parts: string[] = [];
      if (cards?.length) {
        if (cards[0] === 'natural') parts.push("I'm natural");
        else if (cards[0] === 'enhanced') parts.push("I'm enhanced");
        else parts.push('Prefer not to say');
      }
      if (multiSelect?.length) {
        parts.push(`Supplements: ${multiSelect.join(', ')}`);
      }
      return parts.join('. ');
    },
  },

  gear_followup: {
    placeholder: 'e.g., Test 250mg/week, Anavar 50mg/day',
    buildText: () => '',
  },

  equipment: {
    placeholder: 'Or describe your setup...',
    cardOptions: [
      { label: 'Commercial Gym', value: 'commercial', icon: 'business' },
      { label: 'Home Gym', value: 'home', icon: 'home' },
      { label: 'Garage Gym', value: 'garage', icon: 'warehouse' },
    ],
    multiSelectChips: [
      { label: 'Barbell', value: 'barbell' },
      { label: 'Dumbbells', value: 'dumbbells' },
      { label: 'Cables', value: 'cables' },
      { label: 'Machines', value: 'machines' },
      { label: 'Bands', value: 'bands' },
      { label: 'Bench', value: 'bench' },
      { label: 'Rack', value: 'rack' },
    ],
    sectionLabels: ['GYM TYPE', 'AVAILABLE EQUIPMENT'],
    buildText: ({ cards, multiSelect }) => {
      const parts: string[] = [];
      if (cards?.length) {
        parts.push(`I train at a ${cards[0]} gym`);
      }
      if (multiSelect?.length) {
        parts.push(`Equipment: ${multiSelect.join(', ')}`);
      }
      return parts.join('. ');
    },
  },

  health: {
    placeholder: 'Or describe any issues...',
    cardOptions: [
      { label: 'Shoulder issues', value: 'shoulder_issues', icon: 'radio-button-unchecked' },
      { label: 'Lower back pain', value: 'lower_back_pain', icon: 'radio-button-unchecked' },
      { label: 'Knee problems', value: 'knee_problems', icon: 'radio-button-unchecked' },
      { label: 'No injuries', value: 'no_injuries', icon: 'check-circle' },
    ],
    sectionLabels: ['COMMON ISSUES'],
    buildText: ({ cards }) => {
      if (cards?.length) {
        if (cards[0] === 'no_injuries') return 'No current injuries';
        return cards.map(c => c.replace(/_/g, ' ')).join(', ');
      }
      return '';
    },
  },

  health_followup: {
    placeholder: 'Describe your issue...',
    sectionLabels: ['SELECT ONE'],
    cardOptions: [], // Overridden dynamically in onboarding.tsx
    buildText: ({ cards }) => {
      if (cards?.length) return cards.map(c => c.replace(/_/g, ' ')).join(', ');
      return '';
    },
  },
};
