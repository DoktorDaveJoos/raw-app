import { View, Text, Pressable, TextInput } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  FadeInUp,
  LinearTransition,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme';
import type { SessionEvent, Set, SuggestionOption } from '@/lib/api';

// Hook to track previous value for detecting status transitions
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

type FeedbackType = 'exercise' | 'unit' | 'structure' | 'note';

function determineFeedbackType(option: SuggestionOption): FeedbackType {
  const outputJson = option.output_json as Record<string, unknown> | undefined;

  // "Save as note only" option
  if (outputJson?.action_type === 'note' || option.label?.toLowerCase().includes('note')) {
    return 'note';
  }

  // Unit disambiguation (label contains kg/lb)
  if (option.label?.match(/\b(kg|lb|lbs)\b/i)) {
    return 'unit';
  }

  // Exercise disambiguation (has exercise without ID match)
  const exercise = outputJson?.exercise as Record<string, unknown> | undefined;
  if (exercise?.name && !exercise?.id) {
    return 'exercise';
  }

  return 'structure';
}

interface EventBubbleProps {
  event: SessionEvent;
  onSelectSuggestion?: (eventId: number, optionIndex: number, feedbackType: FeedbackType) => void;
  onSelectClarificationOption?: (eventId: number, optionIndex: number) => void;
  onEditRawText?: (eventId: number, currentText: string) => void;
  onSubmitMissingValue?: (eventId: number, field: 'reps' | 'weight' | 'set_count', value: number) => void;
  onEdit?: (eventId: number, rawText: string, exerciseName: string) => void;
  onDelete?: (eventId: number, exerciseName: string) => void;
  skipEntranceAnimation?: boolean;
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

function getRirColors(rir: number | null | undefined, rpe: number | null | undefined): { text: string; bg: string; value: number } | null {
  // Use rir directly if available
  let rirValue: number | null = rir ?? null;

  // Fall back to calculating from rpe if rir not available
  if (rirValue === null && rpe !== null && rpe !== undefined) {
    rirValue = 10 - rpe;
  }

  if (rirValue === null) return null;

  if (rirValue >= 2) return { text: '#6FCF97', bg: '#2D4A3E', value: rirValue }; // Green
  if (rirValue === 1) return { text: '#F2C94C', bg: '#4A3D2D', value: rirValue }; // Yellow
  return { text: '#EB5757', bg: '#4A2D2D', value: rirValue }; // Red (@0)
}

function SetRow({ set }: { set: Set }) {
  const rirColors = getRirColors(set.rir, set.rpe);
  const unit = set.unit ?? 'kg';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        paddingVertical: 8,
        width: '100%',
      }}
    >
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_500Medium',
          fontSize: 13,
          color: '#9CA3AF',
        }}
      >
        Set {set.set_number}
      </Text>
      <Text
        style={{
          fontFamily: 'SpaceGrotesk_400Regular',
          fontSize: 13,
          color: '#6B7280',
        }}
      >
        {set.reps} reps
      </Text>
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
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 10,
              color: rirColors.text,
            }}
          >
            @{rirColors.value} RIR
          </Text>
        </View>
      )}
      {set.weight_kg !== null && set.weight_kg !== undefined && (
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_500Medium',
            fontSize: 13,
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

function ParsedExerciseContent({
  event,
  onEdit,
  onDelete,
}: {
  event: SessionEvent;
  onEdit?: (eventId: number, rawText: string, exerciseName: string) => void;
  onDelete?: (eventId: number, exerciseName: string) => void;
}) {
  const exerciseName = event.exercise_name || 'Exercise';

  return (
    <View style={{ gap: 4 }}>
      {/* Header with check icon, exercise name, and action icons */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <MaterialIcons name="check-circle" size={16} color="#666666" />
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 15,
              color: '#FFFFFF',
            }}
          >
            {exerciseName}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable onPress={() => onEdit?.(event.id, event.raw_text, exerciseName)} hitSlop={8}>
            <MaterialIcons name="edit" size={18} color="#6B7280" />
          </Pressable>
          <Pressable onPress={() => onDelete?.(event.id, exerciseName)} hitSlop={8}>
            <MaterialIcons name="delete" size={18} color="#EF4444" />
          </Pressable>
        </View>
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
      <MaterialIcons name="warning" size={16} color="#FFFFFF" />
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

function ParsedBubble({
  event,
  onEdit,
  onDelete,
}: {
  event: SessionEvent;
  onEdit?: (eventId: number, rawText: string, exerciseName: string) => void;
  onDelete?: (eventId: number, exerciseName: string) => void;
}) {
  const renderContent = () => {
    switch (event.type) {
      case 'symptom':
        return <ParsedSymptomContent event={event} />;
      case 'readiness':
        return <ParsedReadinessContent event={event} />;
      case 'note':
        return <ParsedNoteContent event={event} />;
      default:
        return <ParsedExerciseContent event={event} onEdit={onEdit} onDelete={onDelete} />;
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
  onSelectClarificationOption,
  onEditRawText,
}: {
  event: SessionEvent;
  onSelectSuggestion?: (eventId: number, optionIndex: number, feedbackType: FeedbackType) => void;
  onSelectClarificationOption?: (eventId: number, optionIndex: number) => void;
  onEditRawText?: (eventId: number, currentText: string) => void;
}) {
  // Determine which flow to use:
  // 1. clarification.type === 'ambiguity' -> use clarification options with /clarify endpoint
  // 2. suggestions exist (no clarification) -> use suggestions with /feedback endpoint
  const isClarificationAmbiguity = event.clarification?.type === 'ambiguity';
  const clarificationOptions = event.clarification?.options ?? [];
  const suggestionOptions = event.suggestions?.options ?? [];

  const options = isClarificationAmbiguity ? clarificationOptions : suggestionOptions;
  const promptMessage = event.clarification?.message;

  const handleOptionPress = (index: number) => {
    if (isClarificationAmbiguity) {
      onSelectClarificationOption?.(event.id, index);
    } else {
      const option = suggestionOptions[index];
      if (option) {
        const feedbackType = determineFeedbackType(option);
        onSelectSuggestion?.(event.id, index, feedbackType);
      }
    }
  };

  const getPromptText = () => {
    if (promptMessage) return promptMessage;
    if (options.length === 0) return 'Please select an option:';
    if (isClarificationAmbiguity) return 'Which interpretation is correct?';
    const feedbackType = determineFeedbackType(suggestionOptions[0]);
    switch (feedbackType) {
      case 'exercise': return 'Which exercise did you mean?';
      case 'unit': return 'Which unit did you mean?';
      case 'note': return 'Save as note?';
      default: return 'Please confirm:';
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
          {getPromptText()}
        </Text>

        {/* Option buttons */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {options.map((option, index) => {
            const label = isClarificationAmbiguity
              ? (option as { label: string }).label
              : ((option as SuggestionOption).label || (option as SuggestionOption).exercise_name);

            return (
              <Pressable
                key={index}
                onPress={() => handleOptionPress(index)}
                style={{
                  flex: options.length <= 2 ? 1 : undefined,
                  minWidth: options.length > 2 ? '45%' : undefined,
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
                  {label}
                </Text>
                {!isClarificationAmbiguity && event.sets && event.sets.length > 0 && (
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
            );
          })}
        </View>

        {/* Edit raw text button */}
        <Pressable
          onPress={() => onEditRawText?.(event.id, event.raw_text)}
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
  onEditRawText?: (eventId: number, currentText: string) => void;
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
              justifyContent: 'space-between',
              backgroundColor: colors.card,
              borderRadius: 10,
              paddingHorizontal: 14,
              height: 44,
              borderWidth: 1,
              borderColor: colors.borderSubtle,
            }}
          >
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="0"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              style={{
                fontFamily: 'SpaceGrotesk_500Medium',
                fontSize: 16,
                color: '#FFFFFF',
              }}
              onSubmitEditing={handleSubmit}
            />
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_400Regular',
                fontSize: 14,
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
              backgroundColor: inputValue.trim() && !isNaN(parseInt(inputValue, 10)) ? colors.primary : '#374151',
              borderRadius: 10,
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="checkmark"
              size={20}
              color={inputValue.trim() && !isNaN(parseInt(inputValue, 10)) ? '#121212' : '#6B7280'}
            />
          </Pressable>
        </View>

        {/* Edit raw text button */}
        <Pressable
          onPress={() => onEditRawText?.(event.id, event.raw_text)}
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

export function EventBubble({
  event,
  onSelectSuggestion,
  onSelectClarificationOption,
  onEditRawText,
  onSubmitMissingValue,
  onEdit,
  onDelete,
  skipEntranceAnimation,
}: EventBubbleProps) {
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

  // Track previous status for transition animations
  const prevStatus = usePrevious(event.status);
  const contentScale = useSharedValue(1);

  // Animate on status transition (processing → resolved)
  useEffect(() => {
    const wasProcessing = prevStatus === 'queued' || prevStatus === 'processing';
    const isNowResolved =
      event.status === 'completed' ||
      event.status === 'needs_clarification' ||
      event.status === 'failed';

    if (wasProcessing && isNowResolved) {
      contentScale.value = withSequence(
        withTiming(0.97, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [event.status, prevStatus, contentScale]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
  }));

  // Define entrance animation (only if not skipped)
  const enteringAnimation = skipEntranceAnimation
    ? undefined
    : FadeInUp.duration(300).springify().damping(15);

  return (
    <Animated.View
      style={[{ gap: 4 }, scaleStyle]}
      entering={enteringAnimation}
      layout={LinearTransition.springify().damping(15)}
    >
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
      {isParsed && <ParsedBubble event={event} onEdit={onEdit} onDelete={onDelete} />}
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
          onSelectClarificationOption={onSelectClarificationOption}
          onEditRawText={onEditRawText}
        />
      )}
      {isFailed && <FailedBubble event={event} />}
    </Animated.View>
  );
}

export type { EventBubbleProps };
