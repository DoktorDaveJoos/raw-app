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
        paddingHorizontal: 16,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
        gap: 12,
      }}
    >
      <View
        style={{
          position: 'relative',
          height: 80,
          backgroundColor: '#1E1E1E',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: '#2A2A2A',
        }}
      >
        <TextInput
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: 20,
            paddingRight: 60,
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 15,
            color: '#FFFFFF',
          }}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={true}
          textAlignVertical="top"
        />
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={{
            position: 'absolute',
            right: 12,
            top: 18,
            width: 44,
            height: 44,
            borderRadius: 22,
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
