import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ProfileSectionProps {
  icon: string;
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export function ProfileSection({
  icon,
  title,
  summary,
  expanded,
  onToggle,
  saving,
  onCancel,
  onSave,
  children,
}: ProfileSectionProps) {
  return (
    <View
      style={{
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: expanded ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Header */}
      <Pressable
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          gap: 12,
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#2A2A2A',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialIcons
            name={icon as keyof typeof MaterialIcons.glyphMap}
            size={18}
            color="#9CA3AF"
          />
        </View>

        {/* Title + Summary */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 14,
              color: '#FFFFFF',
            }}
          >
            {title}
          </Text>
          {!expanded && (
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                fontSize: 13,
                color: '#9CA3AF',
              }}
              numberOfLines={1}
            >
              {summary}
            </Text>
          )}
        </View>

        {/* Chevron */}
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={22}
          color="#6B7280"
        />
      </Pressable>

      {/* Expanded Content */}
      {expanded && (
        <View>
          {/* Divider */}
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 }} />

          {/* Form Content */}
          <View style={{ paddingTop: 12, paddingHorizontal: 16, paddingBottom: 12, gap: 12 }}>
            {children}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
            <Pressable
              onPress={onCancel}
              disabled={saving}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#252525',
                alignItems: 'center',
                justifyContent: 'center',
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
              onPress={onSave}
              disabled={saving}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {saving ? (
                <ActivityIndicator color="#121212" size="small" />
              ) : (
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_600SemiBold',
                    fontSize: 14,
                    color: '#121212',
                  }}
                >
                  Save
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
