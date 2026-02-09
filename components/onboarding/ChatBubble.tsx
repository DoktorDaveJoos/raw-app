import { View, Text } from 'react-native';

interface ChatBubbleProps {
  type: 'ai' | 'user' | 'confirm';
  content: string;
  parsedData?: Record<string, unknown>;
  isWelcome?: boolean;
}

export function ChatBubble({ type, content, parsedData, isWelcome }: ChatBubbleProps) {
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
          .filter(([, v]) => v != null && v !== '')
          .map(([key, value]) => {
            if (Array.isArray(value)) return value.join(', ');
            return `${key}: ${value}`;
          })
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
          gap: isWelcome ? 4 : 8,
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
      </View>
    </View>
  );
}
