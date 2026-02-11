import { View, Text, TextInput, TextInputProps } from 'react-native';

interface ProfileTextInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  suffix?: string;
}

export function ProfileTextInput({ label, suffix, ...props }: ProfileTextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          fontSize: 13,
          color: '#9CA3AF',
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          placeholderTextColor="#6B7280"
          style={{
            flex: 1,
            backgroundColor: '#1E1E1E',
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: '#3A3A3A',
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 15,
            color: '#FFFFFF',
          }}
          {...props}
        />
        {suffix && (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 14,
              color: '#6B7280',
              marginLeft: 8,
            }}
          >
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
}
