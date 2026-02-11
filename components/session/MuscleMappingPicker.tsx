import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ArrowRight, Lock } from 'lucide-react-native';
import { colors } from '@/lib/theme';
import { MuscleGroupChip } from './MuscleGroupChip';
import { CategoryTabs } from './CategoryTabs';
import type { MuscleGroup, MuscleMappingEntry } from '@/lib/api';

type Category = 'push' | 'pull' | 'arms' | 'legs' | 'core';

interface MuscleMappingPickerProps {
  muscleGroups: MuscleGroup[];
  exerciseName: string;
  onSubmit: (mappings: MuscleMappingEntry[]) => void;
  onSkip: () => void;
}

type MuscleState = {
  [key: string]: 'off' | 'primary' | 'secondary';
};

export function MuscleMappingPicker({
  muscleGroups,
  exerciseName,
  onSubmit,
  onSkip,
}: MuscleMappingPickerProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [activeCategory, setActiveCategory] = useState<Category>('arms');
  const [muscleStates, setMuscleStates] = useState<MuscleState>({});

  // Filter muscles by category
  const filteredMuscles = muscleGroups.filter((m) => m.category === activeCategory);

  // Get primary selections
  const primaryMuscles = muscleGroups.filter((m) => muscleStates[m.key] === 'primary');
  const canProceed = primaryMuscles.length > 0;

  // Toggle muscle state
  const toggleMuscle = (muscleKey: string) => {
    setMuscleStates((prev) => {
      const current = prev[muscleKey] || 'off';
      if (step === 1) {
        // Step 1: Off → Primary → Off
        return { ...prev, [muscleKey]: current === 'off' ? 'primary' : 'off' };
      } else {
        // Step 2: Off → Secondary → Off (prevent selecting primary muscles)
        if (prev[muscleKey] === 'primary') return prev; // Already primary, can't change
        return { ...prev, [muscleKey]: current === 'off' ? 'secondary' : 'off' };
      }
    });
  };

  const handleNext = () => {
    if (step === 1 && canProceed) {
      setStep(2);
    }
  };

  const handleDone = () => {
    const mappings: MuscleMappingEntry[] = muscleGroups
      .filter((m) => muscleStates[m.key] === 'primary' || muscleStates[m.key] === 'secondary')
      .map((m) => ({
        muscle_group_key: m.key,
        contribution: muscleStates[m.key] === 'primary' ? 1.0 : 0.5,
      }));
    onSubmit(mappings);
  };

  const handleSkipSecondary = () => {
    const mappings: MuscleMappingEntry[] = primaryMuscles.map((m) => ({
      muscle_group_key: m.key,
      contribution: 1.0,
    }));
    onSubmit(mappings);
  };

  return (
    <View
      style={{
        backgroundColor: colors.cardElevated,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <View style={{ padding: 16, gap: 8 }}>
        {/* Step indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 12,
              color: colors.textDim,
            }}
          >
            Step {step} of 2
          </Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: step >= 1 ? colors.primary : colors.borderSubtle,
              }}
            />
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: step >= 2 ? colors.primary : colors.borderSubtle,
              }}
            />
          </View>
        </View>

        {/* Title */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_700Bold',
            fontSize: 18,
            color: colors.textPrimary,
          }}
        >
          {step === 1 ? 'Select primary muscles' : 'Select secondary muscles'}
        </Text>

        {/* Hint */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          {step === 1
            ? 'Muscles directly worked. Counts as full sets.'
            : 'Muscles indirectly worked. Optional.'}
        </Text>

        {/* Primary preview (step 2 only) */}
        {step === 2 && primaryMuscles.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Lock size={14} color={colors.textDim} />
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  fontSize: 12,
                  color: colors.textDim,
                }}
              >
                Primary:
              </Text>
            </View>
            {primaryMuscles.map((muscle) => (
              <View
                key={muscle.key}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    fontSize: 12,
                    color: colors.background,
                  }}
                >
                  {muscle.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Category tabs */}
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      {/* Muscle chips */}
      <ScrollView
        style={{ maxHeight: 300 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
      >
        {filteredMuscles.map((muscle) => (
          <MuscleGroupChip
            key={muscle.key}
            name={muscle.name}
            state={muscleStates[muscle.key] || 'off'}
            onPress={() => toggleMuscle(muscle.key)}
            size={step === 1 ? 'large' : 'small'}
          />
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ padding: 16, gap: 12 }}>
        {step === 1 ? (
          <Pressable
            onPress={handleNext}
            disabled={!canProceed}
            style={{
              backgroundColor: canProceed ? colors.primary : colors.card,
              borderRadius: 12,
              paddingVertical: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 15,
                color: canProceed ? colors.background : colors.textDim,
              }}
            >
              Next: Secondary muscles
            </Text>
            <ArrowRight size={18} color={canProceed ? colors.background : colors.textDim} />
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={handleDone}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 15,
                  color: colors.background,
                }}
              >
                Done
              </Text>
            </Pressable>
            <Pressable onPress={handleSkipSecondary} style={{ alignSelf: 'center' }}>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_500Medium',
                  fontSize: 13,
                  color: colors.textDim,
                }}
              >
                Skip — no secondary muscles
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
