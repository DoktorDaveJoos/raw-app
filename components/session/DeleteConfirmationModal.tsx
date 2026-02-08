import { View, Text, Pressable, Modal, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface DeleteConfirmationModalProps {
  visible: boolean;
  exerciseName: string;
  isDeleting: boolean;
  isDeleted: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({
  visible,
  exerciseName,
  isDeleting,
  isDeleted,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isDeleted ? undefined : onCancel}
    >
      <Pressable
        onPress={isDeleted ? undefined : onCancel}
        style={{
          flex: 1,
          backgroundColor: '#000000B3',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#2A2A2A',
            borderRadius: 20,
            width: 320,
            padding: 24,
            gap: 20,
            alignItems: 'center',
          }}
        >
          {isDeleted ? (
            <>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#22C55E20',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="check-circle" size={28} color="#22C55E" />
              </View>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 18,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                Deleted
              </Text>
            </>
          ) : (
            <>
              {/* Icon */}
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: '#EF444420',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="delete" size={28} color="#EF4444" />
              </View>

              {/* Title */}
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 18,
                  color: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                Delete Exercise?
              </Text>

              {/* Description */}
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  fontSize: 14,
                  color: '#9CA3AF',
                  lineHeight: 20,
                  textAlign: 'center',
                }}
              >
                Are you sure you want to delete {exerciseName}? This action cannot be undone.
              </Text>

              {/* Button row */}
              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <Pressable
                  onPress={onCancel}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    backgroundColor: '#1E1E1E',
                    borderWidth: 1,
                    borderColor: '#2A2A2A',
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    opacity: isDeleting ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk_600SemiBold',
                      fontSize: 14,
                      color: '#FFFFFF',
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onConfirm}
                  disabled={isDeleting}
                  style={{
                    flex: 1,
                    backgroundColor: '#EF4444',
                    borderRadius: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 48,
                  }}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      style={{
                        fontFamily: 'SpaceGrotesk_600SemiBold',
                        fontSize: 14,
                        color: '#FFFFFF',
                      }}
                    >
                      Delete
                    </Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export type { DeleteConfirmationModalProps };
