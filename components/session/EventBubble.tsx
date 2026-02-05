import { View, Text, Pressable, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
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
  onSubmitMissingValue?: (eventId: number, field: 'reps' | 'weight' | 'set_count', value: number) => void;
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
  const unit = sets[0]?.unit ?? 'kg';
  if (weight != null) return `${count} \u00d7 ${weight} ${unit}`;
  return `${count} set${count !== 1 ? 's' : ''}`;
}

function getRirColors(rpe: number | null | undefined): { text: string; bg: string } | null {
  if (rpe === null || rpe === undefined) return null;
  const rir = 10 - rpe;
  if (rir >= 2) return { text: '#6FCF97', bg: '#2D4A3E' }; // Green
  if (rir === 1) return { text: '#F2C94C', bg: '#4A3D2D' }; // Yellow
  return { text: '#EB5757', bg: '#4A2D2D' }; // Red (@0)
}

function SetRow({ set }: { set: Set }) {
  const rirColors = getRirColors(set.rpe);
  const unit = set.unit ?? 'kg';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingVertical: 6,
        width: '100%',
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          fontSize: 12,
          color: '#9CA3AF',
        }}
      >
        Set {set.set_number}
      </Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 12,
          color: '#6B7280',
        }}
      >
        {set.reps} reps
      </Text>
      {set.rpe !== null && set.rpe !== undefined && (
        <View
          style={{
            backgroundColor: '#374151',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 11,
              color: '#9CA3AF',
            }}
          >
            RPE {set.rpe}
          </Text>
        </View>
      )}
      {rirColors && (
        <View
          style={{
            backgroundColor: rirColors.bg,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_500Medium',
              fontSize: 11,
              color: rirColors.text,
            }}
          >
            @{10 - (set.rpe ?? 0)}
          </Text>
        </View>
      )}
      {set.weight_kg !== null && set.weight_kg !== undefined && (
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            fontSize: 12,
            color: '#9CA3AF',
          }}
        >
          {set.weight_kg} {unit}
        </Text>
      )}
    </View>
  );
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
          gap: 10,
        },
      ]}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 14,
          color: '#FFFFFF',
          flex: 1,
        }}
      >
        {event.raw_text}
      </Text>
      <AnimatedDots />
    </View>
  );
}

function ParsedExerciseContent({ event }: { event: SessionEvent }) {
  return (
    <View style={{ gap: 4 }}>
      {/* Header with check icon and exercise name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <MaterialIcons name="check-circle" size={16} color="#666666" />
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 15,
            color: '#FFFFFF',
          }}
        >
          {event.exercise_name || 'Exercise'}
        </Text>
      </View>

      {/* Set rows */}
      {event.sets && event.sets.length > 0 && (
        <View style={{ paddingTop: 4 }}>
          {event.sets.map((set, index) => (
            <SetRow key={set.id ?? index} set={set} />
          ))}
        </View>
      )}
    </View>
  );
}

function ParsedSymptomContent({ event }: { event: SessionEvent }) {
  const symptom = event.symptom;
  if (!symptom) return null;
  const label = [symptom.body_part, symptom.symptom_type].filter(Boolean).join(' ');
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <MaterialIcons name="warning" size={16} color="#F59E0B" />
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_600SemiBold',
          fontSize: 15,
          color: '#FFFFFF',
          flex: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ParsedReadinessContent({ event }: { event: SessionEvent }) {
  const readiness = event.readiness;
  if (!readiness) return null;
  const score = readiness.value_score != null ? `${readiness.value_score}/5` : readiness.value_text;
  const label = score ? `${readiness.signal_type}: ${score}` : readiness.signal_type;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <MaterialIcons name="battery-charging-full" size={16} color="#3B82F6" />
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_600SemiBold',
          fontSize: 15,
          color: '#FFFFFF',
          flex: 1,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function ParsedNoteContent({ event }: { event: SessionEvent }) {
  const note = event.note;
  if (!note) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <MaterialIcons name="notes" size={16} color="#8B5CF6" />
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 14,
          color: '#FFFFFF',
          flex: 1,
        }}
      >
        {note.text}
      </Text>
    </View>
  );
}

function ParsedBubble({ event }: { event: SessionEvent }) {
  const renderContent = () => {
    switch (event.type) {
      case 'symptom':
        return <ParsedSymptomContent event={event} />;
      case 'readiness':
        return <ParsedReadinessContent event={event} />;
      case 'note':
        return <ParsedNoteContent event={event} />;
      default:
        return <ParsedExerciseContent event={event} />;
    }
  };

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
        {renderContent()}
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
                {option.label || option.exercise_name}
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

function MissingInfoBubble({
  event,
  onSubmitMissingValue,
  onEditRawText,
}: {
  event: SessionEvent;
  onSubmitMissingValue?: (eventId: number, field: 'reps' | 'weight' | 'set_count', value: number) => void;
  onEditRawText?: (eventId: number) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const clarification = event.clarification;
  const missingField = clarification?.missing_field;

  const getFieldLabel = () => {
    switch (missingField) {
      case 'reps':
        return 'reps';
      case 'weight':
        return 'kg';
      case 'set_count':
        return 'sets';
      default:
        return '';
    }
  };

  const handleSubmit = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 0 && missingField && onSubmitMissingValue) {
      onSubmitMissingValue(event.id, missingField, numValue);
    }
  };

  // Extract parsed info from partial_payload for display tags
  const partialPayload = clarification?.partial_payload as Record<string, unknown> | null;
  const exerciseName = partialPayload?.exercise_name as string | undefined;
  const isWarmup = partialPayload?.is_warmup as boolean | undefined;

  return (
    <View style={[BUBBLE_RADIUS, { backgroundColor: colors.card, overflow: 'hidden' }]}>
      {/* Raw text top with parsed info tags */}
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
        {/* Parsed info tags */}
        {(exerciseName || isWarmup) && (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {exerciseName && (
              <View
                style={{
                  backgroundColor: '#374151',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_500Medium',
                    fontSize: 11,
                    color: '#D1D5DB',
                  }}
                >
                  {exerciseName}
                </Text>
              </View>
            )}
            {isWarmup && (
              <View
                style={{
                  backgroundColor: '#4A3D2D',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'SpaceGrotesk_500Medium',
                    fontSize: 11,
                    color: '#F2C94C',
                  }}
                >
                  Warmup
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Input section bottom */}
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
        {/* Question text */}
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            fontSize: 13,
            color: '#9CA3AF',
          }}
        >
          {clarification?.message || `How many ${getFieldLabel()}?`}
        </Text>

        {/* Input row */}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="0"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              style={{
                flex: 1,
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 16,
                color: '#FFFFFF',
                paddingVertical: 10,
              }}
              onSubmitEditing={handleSubmit}
            />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                fontSize: 13,
                color: '#6B7280',
              }}
            >
              {getFieldLabel()}
            </Text>
          </View>
          <Pressable
            onPress={handleSubmit}
            disabled={!inputValue.trim() || isNaN(parseInt(inputValue, 10))}
            style={{
              backgroundColor: inputValue.trim() && !isNaN(parseInt(inputValue, 10)) ? '#FFFFFF' : '#374151',
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_600SemiBold',
                fontSize: 13,
                color: inputValue.trim() && !isNaN(parseInt(inputValue, 10)) ? '#121212' : '#6B7280',
              }}
            >
              Submit
            </Text>
          </Pressable>
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

export function EventBubble({ event, onSelectSuggestion, onEditRawText, onSubmitMissingValue }: EventBubbleProps) {
  const isProcessing = event.status === 'queued' || event.status === 'processing';
  const needsMissingInfo =
    event.status === 'needs_clarification' &&
    event.clarification?.type === 'missing_info';
  const isAmbiguous =
    (event.status === 'completed' &&
      (event.suggestions?.options?.length ?? 0) > 0 &&
      event.suggestions?.selected_index === null) ||
    (event.status === 'needs_clarification' &&
      event.clarification?.type === 'ambiguity');
  const isParsed = event.status === 'completed' && !isAmbiguous;
  const isFailed = event.status === 'failed';

  return (
    <View style={{ gap: 4 }}>
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
      {needsMissingInfo && (
        <MissingInfoBubble
          event={event}
          onSubmitMissingValue={onSubmitMissingValue}
          onEditRawText={onEditRawText}
        />
      )}
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
