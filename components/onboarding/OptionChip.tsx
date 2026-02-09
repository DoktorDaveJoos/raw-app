import { Text, Pressable } from 'react-native';

interface OptionChipProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: (value: string) => void;
}

export function OptionChip({ label, value, selected, onPress }: OptionChipProps) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={{
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: selected ? '#FFFFFF' : '#2A2A2A',
        borderWidth: selected ? 0 : 1,
        borderColor: '#3A3A3A',
      }}
    >
      <Text
        style={{
          fontFamily: selected ? 'SpaceGrotesk_600SemiBold' : 'SpaceGrotesk_500Medium',
          fontSize: 14,
          color: selected ? '#121212' : '#FFFFFF',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
