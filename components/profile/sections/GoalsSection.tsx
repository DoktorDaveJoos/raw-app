import { useState, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import type { Profile } from '@/lib/api';
import { GOAL_OPTIONS, MUSCLE_GROUPS } from '@/lib/constants/profile';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { OptionChip } from '@/components/onboarding/OptionChip';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import type { SectionHandle } from './BasicsSection';

interface GoalsSectionProps {
  profile: Profile;
}

export const GoalsSection = forwardRef<SectionHandle, GoalsSectionProps>(
  function GoalsSection({ profile }, ref) {
    const [primaryGoal, setPrimaryGoal] = useState(profile.primary_goal || '');
    const [targetMuscles, setTargetMuscles] = useState<string[]>(profile.target_muscle_groups || []);

    useImperativeHandle(ref, () => ({
      getSaveData: () => ({
        primary_goal: primaryGoal || undefined,
        target_muscle_groups: targetMuscles,
      }),
    }));

    const toggleMuscle = (value: string) => {
      setTargetMuscles((prev) =>
        prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]
      );
    };

    return (
      <View style={{ gap: 16 }}>
        <SectionLabel label="Primary Goal" />
        <View style={{ gap: 8 }}>
          {GOAL_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              value={option.value}
              icon={option.icon}
              selected={primaryGoal === option.value}
              onSelect={setPrimaryGoal}
            />
          ))}
        </View>

        <SectionLabel label="Target Muscle Groups" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {MUSCLE_GROUPS.map((muscle) => (
            <OptionChip
              key={muscle.value}
              label={muscle.label}
              value={muscle.value}
              selected={targetMuscles.includes(muscle.value)}
              onPress={toggleMuscle}
            />
          ))}
        </View>
      </View>
    );
  }
);
