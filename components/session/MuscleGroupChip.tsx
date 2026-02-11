import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors } from '@/lib/theme';

interface MuscleGroupChipProps {
  name: string;
  state: 'off' | 'primary' | 'secondary';
  onPress: () => void;
  size?: 'large' | 'small';
}

export function MuscleGroupChip({ name, state, onPress, size = 'large' }: MuscleGroupChipProps) {
  const isSelected = state !== 'off';
  const isPrimary = state === 'primary';
  const isSecondary = state === 'secondary';

  const height = size === 'large' ? 64 : 56;

  return (
    <Pressable
      onPress={onPress}
      style={{
        height,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: isSelected ? colors.primary : colors.card,
        borderWidth: isSelected ? 0 : 1,
        borderColor: colors.borderSubtle,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        opacity: isSecondary ? 0.85 : 1,
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_600SemiBold',
          fontSize: 15,
          color: isSelected ? colors.background : colors.textPrimary,
        }}
      >
        {name}
      </Text>
      {isSelected && (
        <Check size={18} color={isPrimary ? colors.background : colors.background} strokeWidth={2.5} />
      )}
    </Pressable>
  );
}
