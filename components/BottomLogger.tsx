import { View, TextInput, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

export interface BottomLoggerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function BottomLogger({
  value,
  onChangeText,
  onSend,
  disabled = false,
}: BottomLoggerProps) {
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  };

  const canSend = !disabled && !!value.trim();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
      }}
    >
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          height: 80,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 20,
          paddingRight: 18,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 14,
            color: '#FFFFFF',
            height: 52,
          }}
          placeholder="eg. bench 3x100kg"
          placeholderTextColor={colors.textDim}
          multiline
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canSend ? 1 : 0.4,
          }}
        >
          <MaterialIcons name="arrow-upward" size={20} color="#121212" />
        </Pressable>
      </View>
    </View>
  );
}
