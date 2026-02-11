import { useState, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import type { Profile } from '@/lib/api';
import { SPLIT_OPTIONS, EXPERIENCE_OPTIONS } from '@/lib/constants/profile';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import { ProfileTextInput } from '../ProfileTextInput';
import type { SectionHandle } from './BasicsSection';

interface TrainingSectionProps {
  profile: Profile;
}

export const TrainingSection = forwardRef<SectionHandle, TrainingSectionProps>(
  function TrainingSection({ profile }, ref) {
    const [currentSplit, setCurrentSplit] = useState(profile.current_split || '');
    const [frequency, setFrequency] = useState(profile.training_frequency?.toString() || '');
    const [experienceLevel, setExperienceLevel] = useState(profile.experience_level || '');

    useImperativeHandle(ref, () => ({
      getSaveData: () => ({
        current_split: currentSplit || undefined,
        training_frequency: frequency ? parseInt(frequency, 10) : undefined,
        experience_level: experienceLevel || undefined,
      }),
    }));

    return (
      <View style={{ gap: 16 }}>
        <SectionLabel label="Training Split" />
        <View style={{ gap: 8 }}>
          {SPLIT_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              value={option.value}
              icon={option.icon}
              selected={currentSplit === option.value}
              onSelect={setCurrentSplit}
            />
          ))}
        </View>

        <SectionLabel label="Frequency" />
        <ProfileTextInput
          label="Sessions per week"
          value={frequency}
          onChangeText={setFrequency}
          keyboardType="number-pad"
          placeholder="e.g. 4"
          suffix="x/week"
        />

        <SectionLabel label="Experience Level" />
        <View style={{ gap: 8 }}>
          {EXPERIENCE_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              value={option.value}
              icon={option.icon}
              selected={experienceLevel === option.value}
              onSelect={setExperienceLevel}
            />
          ))}
        </View>
      </View>
    );
  }
);
