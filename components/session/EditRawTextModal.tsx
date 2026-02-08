import { View, Text, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';

interface EditRawTextModalProps {
  visible: boolean;
  initialText: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (editedText: string) => void;
}

export function EditRawTextModal({
  visible,
  initialText,
  isSubmitting,
  onCancel,
  onSubmit,
}: EditRawTextModalProps) {
  const [text, setText] = useState(initialText);

  // Reset text when modal opens with new initial text
  useEffect(() => {
    if (visible) {
      setText(initialText);
    }
  }, [visible, initialText]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed !== initialText) {
      onSubmit(trimmed);
    }
  };

  const isValid = text.trim().length > 0 && text.trim() !== initialText;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={onCancel}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              width: '100%',
              maxWidth: 400,
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle,
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                Edit raw text
              </Text>
              <Pressable
                onPress={onCancel}
                disabled={isSubmitting}
                hitSlop={8}
              >
                <MaterialIcons name="close" size={20} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* Content */}
            <View style={{ padding: 16, gap: 16 }}>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  fontSize: 13,
                  color: '#9CA3AF',
                }}
              >
                Edit your input and it will be re-parsed by the AI.
              </Text>

              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                autoFocus
                editable={!isSubmitting}
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  fontSize: 15,
                  color: '#FFFFFF',
                  backgroundColor: colors.cardElevated,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  minHeight: 80,
                  textAlignVertical: 'top',
                }}
                placeholderTextColor="#6B7280"
              />

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Pressable
                  onPress={onCancel}
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingVertical: 12,
                    alignItems: 'center',
                    opacity: isSubmitting ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk_500Medium',
                      fontSize: 14,
                      color: '#9CA3AF',
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    backgroundColor: isValid && !isSubmitting ? colors.primary : '#374151',
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 44,
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#121212" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                        fontSize: 14,
                        color: isValid ? '#121212' : '#6B7280',
                      }}
                    >
                      Re-parse
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export type { EditRawTextModalProps };
