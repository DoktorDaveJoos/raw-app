import { View, TextInput, Pressable, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface OnboardingInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onSkip: () => void;
  disabled?: boolean;
  placeholder?: string;
  isLastStep?: boolean;
  skipText?: string;
}

export function OnboardingInputBar({
  value,
  onChangeText,
  onSend,
  onSkip,
  disabled = false,
  placeholder = 'Type your answer...',
  isLastStep = false,
  skipText,
}: OnboardingInputBarProps) {
  const canSend = !disabled && !!value.trim();

  return (
    <View
      style={{
        backgroundColor: '#1A1A1A',
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: '#1E1E1E',
            borderRadius: 24,
            height: 48,
            borderWidth: 1,
            borderColor: '#2A2A2A',
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
        >
          <TextInput
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              fontSize: 15,
              color: '#FFFFFF',
            }}
            placeholder={placeholder}
            placeholderTextColor="#6B7280"
            value={value}
            onChangeText={onChangeText}
            editable={!disabled}
            returnKeyType="send"
            onSubmitEditing={canSend ? onSend : undefined}
          />
        </View>
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: canSend ? 1 : 0.4,
          }}
        >
          <MaterialIcons name="arrow-upward" size={22} color="#121212" />
        </Pressable>
      </View>
      <Pressable
        onPress={onSkip}
        disabled={disabled}
        style={{ alignItems: 'center' }}
      >
        <Text
          style={{
            fontFamily: isLastStep || skipText ? 'SpaceGrotesk_600SemiBold' : 'SpaceGrotesk_500Medium',
            fontSize: 13,
            color: isLastStep || skipText ? '#FFFFFF' : '#6B7280',
          }}
        >
          {skipText ?? (isLastStep ? 'Finish setup' : 'Skip this step')}
        </Text>
      </Pressable>
    </View>
  );
}
