import { useState, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import type { Profile, ProfileUpdate } from '@/lib/api';
import { UNIT_OPTIONS } from '@/lib/constants/profile';
import { OptionCard } from '@/components/onboarding/OptionCard';
import { SectionLabel } from '@/components/onboarding/SectionLabel';
import { ProfileTextInput } from '../ProfileTextInput';

export interface SectionHandle {
  getSaveData: () => ProfileUpdate;
}

interface BasicsSectionProps {
  profile: Profile;
}

export const BasicsSection = forwardRef<SectionHandle, BasicsSectionProps>(
  function BasicsSection({ profile }, ref) {
    const [unitPreference, setUnitPreference] = useState(profile.unit_preference || 'kg');
    const [age, setAge] = useState(profile.age?.toString() || '');
    const [height, setHeight] = useState(profile.height?.toString() || '');
    const [bodyWeight, setBodyWeight] = useState(profile.body_weight?.toString() || '');

    useImperativeHandle(ref, () => ({
      getSaveData: () => ({
        unit_preference: unitPreference,
        age: age ? parseInt(age, 10) : undefined,
        height: height ? parseFloat(height) : undefined,
        body_weight: bodyWeight ? parseFloat(bodyWeight) : undefined,
      }),
    }));

    return (
      <View style={{ gap: 16 }}>
        <SectionLabel label="Unit Preference" />
        <View style={{ gap: 8 }}>
          {UNIT_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              value={option.value}
              icon={option.icon}
              selected={unitPreference === option.value}
              onSelect={setUnitPreference}
            />
          ))}
        </View>

        <SectionLabel label="Body Stats" />
        <ProfileTextInput
          label="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          placeholder="Enter your age"
          suffix="years"
        />
        <ProfileTextInput
          label="Height"
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          placeholder="Enter your height"
          suffix="cm"
        />
        <ProfileTextInput
          label="Body Weight"
          value={bodyWeight}
          onChangeText={setBodyWeight}
          keyboardType="decimal-pad"
          placeholder="Enter your weight"
          suffix={unitPreference}
        />
      </View>
    );
  }
);
