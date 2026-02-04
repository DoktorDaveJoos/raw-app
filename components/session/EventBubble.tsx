import { View, Text, Pressable } from 'react-native';
import { useEffect } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';
import type { SessionEvent, Set } from '@/lib/api';

interface EventBubbleProps {
  event: SessionEvent;
  onSelectSuggestion?: (eventId: number, optionIndex: number) => void;
  onEditRawText?: (eventId: number) => void;
}

const BUBBLE_RADIUS = {
  borderTopLeftRadius: 4,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  borderBottomLeftRadius: 16,
};

function formatSetsSummary(sets: Set[] | null | undefined): string {
  if (!sets || sets.length === 0) return '';
  const count = sets.length;
  const weight = sets[0]?.weight_kg;
  if (weight != null) return `${count} \u00d7 ${weight} kg`;
  return `${count} set${count !== 1 ? 's' : ''}`;
}

function formatTimestamp(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 60000) return 'Just now';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// --- Animated dots for processing state ---

function AnimatedDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const pulse = (duration: number) =>
      withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0.3, { duration }),
        ),
        -1,
        false,
      );

    dot1.value = pulse(600);
    dot2.value = withDelay(200, pulse(600));
    dot3.value = withDelay(400, pulse(600));
  }, [dot1, dot2, dot3]);

  const style1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Animated.View
        style={[
          { width: 4, height: 4, borderRadius: 2, backgroundColor: '#6B7280' },
          style1,
        ]}
      />
      <Animated.View
        style={[
          { width: 4, height: 4, borderRadius: 2, backgroundColor: '#555555' },
          style2,
        ]}
      />
      <Animated.View
        style={[
          { width: 4, height: 4, borderRadius: 2, backgroundColor: '#333333' },
          style3,
        ]}
      />
    </View>
  );
}

// --- Bubble variants ---

function ProcessingBubble({ event }: { event: SessionEvent }) {
  return (
    <View
      style={[
        BUBBLE_RADIUS,
        {
          backgroundColor: colors.card,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 14,
          color: '#FFFFFF',
          flex: 1,
          marginRight: 12,
        }}
      >
        {event.raw_text}
      </Text>
      <AnimatedDots />
    </View>
  );
}

function ParsedBubble({ event }: { event: SessionEvent }) {
  const summary = formatSetsSummary(event.sets);

  return (
    <View style={[BUBBLE_RADIUS, { backgroundColor: colors.card, overflow: 'hidden' }]}>
      {/* Raw text top */}
      <View style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 12,
            fontStyle: 'italic',
            color: '#6B7280',
          }}
        >
          {event.raw_text}
        </Text>
      </View>

      {/* Parsed result bottom */}
      <View
        style={{
          backgroundColor: colors.cardElevated,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          paddingVertical: 12,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <MaterialIcons name="check-circle" size={16} color="#666666" />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 15,
                color: '#FFFFFF',
              }}
            >
              {event.exercise_name || 'Exercise'}
            </Text>
            {summary ? (
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  fontSize: 13,
                  color: '#9CA3AF',
                  marginTop: 2,
                }}
              >
                {summary}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function AmbiguousBubble({
  event,
  onSelectSuggestion,
  onEditRawText,
}: {
  event: SessionEvent;
  onSelectSuggestion?: (eventId: number, optionIndex: number) => void;
  onEditRawText?: (eventId: number) => void;
}) {
  const options = event.suggestions?.options ?? [];

  return (
    <View style={[BUBBLE_RADIUS, { backgroundColor: colors.card, overflow: 'hidden' }]}>
      {/* Raw text top */}
      <View style={{ paddingVertical: 10, paddingHorizontal: 16 }}>
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_400Regular',
            fontSize: 12,
            fontStyle: 'italic',
            color: '#6B7280',
          }}
        >
          {event.raw_text}
        </Text>
      </View>

      {/* Options bottom */}
      <View
        style={{
          backgroundColor: colors.cardElevated,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            fontSize: 13,
            color: '#9CA3AF',
          }}
        >
          Which exercise did you mean?
        </Text>

        {/* Option buttons */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {options.map((option, index) => (
            <Pressable
              key={index}
              onPress={() => onSelectSuggestion?.(event.id, index)}
              style={{
                flex: 1,
                backgroundColor: colors.card,
                borderRadius: 12,
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_600SemiBold',
                  fontSize: 13,
                  color: '#FFFFFF',
                }}
              >
                {option.exercise_name}
              </Text>
              {event.sets && event.sets.length > 0 && (
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_400Regular',
                    fontSize: 11,
                    color: '#9CA3AF',
                    marginTop: 2,
                  }}
                >
                  {formatSetsSummary(event.sets)}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Edit raw text button */}
        <Pressable
          onPress={() => onEditRawText?.(event.id)}
          style={{
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.borderSubtle,
            paddingVertical: 8,
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <MaterialIcons name="edit" size={12} color="#6B7280" />
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            Edit raw text
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function FailedBubble({ event }: { event: SessionEvent }) {
  return (
    <View
      style={[
        BUBBLE_RADIUS,
        {
          backgroundColor: colors.card,
          paddingVertical: 14,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        },
      ]}
    >
      <MaterialIcons name="error-outline" size={16} color="#ef4444" />
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 14,
          color: '#6B7280',
          flex: 1,
        }}
      >
        {event.raw_text}
      </Text>
    </View>
  );
}

// --- Main component ---

export function EventBubble({ event, onSelectSuggestion, onEditRawText }: EventBubbleProps) {
  const isProcessing = event.status === 'queued' || event.status === 'processing';
  const isAmbiguous =
    event.status === 'completed' &&
    (event.suggestions?.options?.length ?? 0) > 0 &&
    event.suggestions?.selected_index === null;
  const isParsed = event.status === 'completed' && !isAmbiguous;
  const isFailed = event.status === 'failed';

  return (
    <View style={{ gap: 6 }}>
      {/* Timestamp */}
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          fontSize: 11,
          color: '#6B7280',
        }}
      >
        {formatTimestamp(event.created_at)}
      </Text>

      {/* Bubble */}
      {isProcessing && <ProcessingBubble event={event} />}
      {isParsed && <ParsedBubble event={event} />}
      {isAmbiguous && (
        <AmbiguousBubble
          event={event}
          onSelectSuggestion={onSelectSuggestion}
          onEditRawText={onEditRawText}
        />
      )}
      {isFailed && <FailedBubble event={event} />}
    </View>
  );
}

export type { EventBubbleProps };
