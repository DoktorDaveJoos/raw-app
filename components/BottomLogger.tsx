import { View, TextInput, Pressable, ScrollView, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

const SHORTCUT_TAGS = [
  { label: 'warmup', text: 'warmup ' },
  { label: '@rir1', text: '@rir1 ' },
  { label: '@rir2', text: '@rir2 ' },
  { label: '@rir3', text: '@rir3 ' },
  { label: 'AMRAP', text: 'AMRAP ' },
  { label: '+2.5kg', text: '+2.5kg ' },
  { label: '+5kg', text: '+5kg ' },
];

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
      >
        {SHORTCUT_TAGS.map((tag) => (
          <Pressable
            key={tag.label}
            onPress={() => onChangeText(value + tag.text)}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              {tag.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
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
