import { View, Text } from 'react-native';
import { PrivacyNote } from './PrivacyNote';

interface ChatBubbleProps {
  type: 'ai' | 'user' | 'confirm';
  content: string;
  parsedData?: Record<string, unknown>;
  isWelcome?: boolean;
  showPrivacyNote?: boolean;
}

export function ChatBubble({ type, content, parsedData, isWelcome, showPrivacyNote }: ChatBubbleProps) {
  if (type === 'user') {
    return (
      <View style={{ alignItems: 'flex-end', width: '100%' }}>
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 16,
            maxWidth: '85%',
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 15,
              color: '#121212',
            }}
          >
            {content}
          </Text>
        </View>
      </View>
    );
  }

  if (type === 'confirm') {
    const tags = parsedData
      ? Object.entries(parsedData)
          .filter(([key, v]) => key !== 'confidence' && v != null && v !== '' && !(Array.isArray(v) && v.length === 0))
          .map(([key, value]) => {
            // Gear step fields
            if (key === 'is_enhanced') return value ? 'Enhanced' : 'Natural';

            // Welcome step fields
            if (key === 'age') return `Age: ${value}`;
            if (key === 'gender') {
              const genderStr = String(value);
              return genderStr.charAt(0).toUpperCase() + genderStr.slice(1);
            }
            if (key === 'body_weight') return `${value} kg`; // Assume kg initially
            if (key === 'height') return `${value} cm`;

            // Units step field
            if (key === 'unit_preference') return value === 'kg' ? 'Kilograms' : 'Pounds';

            // Health step: injuries array
            if (key === 'injuries' && Array.isArray(value)) {
              return value.map((item: { body_part?: string }) => {
                return item.body_part?.replace(/_/g, ' ') || 'Injury';
              }).join(', ');
            }
            if (key === 'movements_to_avoid') return null; // Don't show as tag

            // Handle arrays of objects (e.g., compounds)
            if (Array.isArray(value)) {
              const mapped = value.map((item) => {
                if (typeof item === 'object' && item !== null) {
                  // For objects, try to extract the "name" field, or join all values
                  return item.name || Object.values(item).filter(Boolean).join(' ');
                }
                return String(item);
              });
              return mapped.join(', ');
            }
            if (typeof value === 'object' && value !== null) {
              // Handle nested objects by converting to readable format
              return Object.values(value).filter(Boolean).join(', ');
            }
            return `${key}: ${value}`;
          })
          .filter((tag): tag is string => tag != null)
      : [];

    return (
      <View style={{ width: '100%' }}>
        <View
          style={{
            backgroundColor: '#1E1E1E',
            borderRadius: 16,
            padding: 16,
            gap: 12,
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              fontSize: 14,
              color: '#9CA3AF',
            }}
          >
            {content}
          </Text>
          {tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((tag, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: '#2A2A2A',
                    borderRadius: 6,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'SpaceGrotesk_500Medium',
                      fontSize: 12,
                      color: '#FFFFFF',
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  // AI bubble
  return (
    <View style={{ width: '100%', gap: 12 }}>
      {isWelcome && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 12,
                color: '#121212',
              }}
            >
              R
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 12,
              color: '#6B7280',
              letterSpacing: 1,
            }}
          >
            RAW
          </Text>
        </View>
      )}
      <View
        style={{
          backgroundColor: '#1E1E1E',
          borderRadius: 16,
          padding: 16,
          gap: 12,
        }}
      >
        {isWelcome ? (
          <>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 18,
                color: '#FFFFFF',
              }}
            >
              Welcome to RAW! {'\u{1F44B}'}
            </Text>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                fontSize: 15,
                color: '#9CA3AF',
                lineHeight: 15 * 1.4,
              }}
            >
              {content}
            </Text>
          </>
        ) : (
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_400Regular',
              fontSize: 15,
              color: '#FFFFFF',
              lineHeight: 15 * 1.4,
            }}
          >
            {content}
          </Text>
        )}

        {/* Privacy note - only for gear step */}
        {showPrivacyNote && (
          <PrivacyNote text="This info is private and only used for recommendations" />
        )}
      </View>
    </View>
  );
}
