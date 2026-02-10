import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface PrivacyNoteProps {
  text: string;
}

export function PrivacyNote({ text }: PrivacyNoteProps) {
  return (
    <View className="flex-row items-center gap-2 rounded-lg px-3 py-2.5" style={{ backgroundColor: '#2A2A2A' }}>
      <MaterialIcons name="lock" size={16} color="#6B7280" />
      <Text
        className="flex-1 text-xs"
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          color: '#6B7280',
          lineHeight: 15.6,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
