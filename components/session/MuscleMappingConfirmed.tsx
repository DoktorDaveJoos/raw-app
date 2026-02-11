import { View, Text, Pressable } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { colors } from '@/lib/theme';
import type { MuscleGroup } from '@/lib/api';

interface MuscleMappingConfirmedProps {
  exerciseName: string;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  onEdit?: () => void;
}

export function MuscleMappingConfirmed({
  exerciseName,
  primaryMuscles,
  secondaryMuscles,
  onEdit,
}: MuscleMappingConfirmedProps) {
  return (
    <View
      style={{
        backgroundColor: colors.cardElevated,
        borderRadius: 16,
        padding: 16,
        gap: 16,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#10B981" fill="#10B981" />
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 14,
              color: '#10B981',
            }}
          >
            Muscles tagged
          </Text>
        </View>
        {onEdit && (
          <Pressable onPress={onEdit}>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              Edit
            </Text>
          </Pressable>
        )}
      </View>

      {/* Primary muscles */}
      {primaryMuscles.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 12,
              color: colors.textDim,
            }}
          >
            Primary:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {primaryMuscles.map((muscle) => (
              <View
                key={muscle.key}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    fontSize: 13,
                    color: colors.background,
                  }}
                >
                  {muscle.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Secondary muscles */}
      {secondaryMuscles.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 12,
              color: colors.textDim,
            }}
          >
            Secondary:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {secondaryMuscles.map((muscle) => (
              <View
                key={muscle.key}
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    fontSize: 13,
                    color: colors.textMuted,
                  }}
                >
                  {muscle.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
