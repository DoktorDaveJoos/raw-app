import { View, Text, Pressable } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '@/lib/theme';

interface MuscleMappingPromptProps {
  exerciseName: string;
  onTagMuscles: () => void;
  onSkip: () => void;
}

export function MuscleMappingPrompt({ exerciseName, onTagMuscles, onSkip }: MuscleMappingPromptProps) {
  return (
    <View
      style={{
        backgroundColor: colors.cardElevated,
        borderRadius: 16,
        padding: 16,
        gap: 16,
      }}
    >
      {/* Header with sparkles */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Sparkles size={16} color="#F59E0B" fill="#F59E0B" />
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 14,
            color: '#F59E0B',
          }}
        >
          New exercise detected
        </Text>
      </View>

      {/* Description */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 14,
          color: colors.textMuted,
          lineHeight: 20,
        }}
      >
        Tag muscles to track your weekly volume per muscle group.
      </Text>

      {/* Primary button */}
      <Pressable
        onPress={onTagMuscles}
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
          Tag muscles
        </Text>
      </Pressable>

      {/* Skip link */}
      <Pressable onPress={onSkip} style={{ alignSelf: 'center' }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            fontSize: 13,
            color: colors.textDim,
          }}
        >
          Skip
        </Text>
      </Pressable>
    </View>
  );
}
