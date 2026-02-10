import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface OptionCardProps {
  label: string;
  value: string;
  icon: string;
  selected: boolean;
  onSelect: (value: string) => void;
  iconColor?: string;
  textColor?: string;
}

export function OptionCard({ label, value, icon, selected, onSelect, iconColor, textColor }: OptionCardProps) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: selected ? '#FFFFFF' : '#1E1E1E',
        borderWidth: selected ? 0 : 1,
        borderColor: '#3A3A3A',
        width: '100%',
      }}
    >
      <MaterialIcons
        name={icon as keyof typeof MaterialIcons.glyphMap}
        size={20}
        color={selected ? '#121212' : (iconColor ?? '#9CA3AF')}
      />
      <Text
        style={{
          fontFamily: selected ? 'SpaceGrotesk_600SemiBold' : 'SpaceGrotesk_500Medium',
          fontSize: 15,
          color: selected ? '#121212' : (textColor ?? '#FFFFFF'),
          flex: 1,
        }}
      >
        {label}
      </Text>
      {selected && (
        <MaterialIcons name="check" size={20} color="#121212" />
      )}
    </Pressable>
  );
}
