import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { BottomLogger } from '@/components/BottomLogger';
import { EventBubble, EditRawTextModal, DeleteConfirmationModal } from '@/components/session';
import { Skeleton } from '@/components/ui';
import { useSession, useFinishSession, useCreateEvent, useDeleteEvent, useUpdateEvent, useSubmitFeedback, useSubmitClarification } from '@/hooks';
import type { SessionEvent } from '@/lib/api';
import { formatDuration, calculateDuration } from '@/lib/utils';

export default function LoggingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsed = parseInt(id, 10);
  const sessionId = isNaN(parsed) ? undefined : parsed;

  const [inputText, setInputText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isSending = useRef(false);

  // Edit modal state (for clarification flow)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalEventId, setEditModalEventId] = useState<number | null>(null);
  const [editModalText, setEditModalText] = useState('');

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ eventId: number; exerciseName: string } | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Edit mode state (inline editing via bottom logger)
  const [editMode, setEditMode] = useState(false);
  const [editTarget, setEditTarget] = useState<{ eventId: number; exerciseName: string } | null>(null);

  // Fetch session data
  const { data: session, isLoading, isError, refetch } = useSession(sessionId);
  const finishSession = useFinishSession();
  const createEvent = useCreateEvent(sessionId ?? 0);
  const feedback = useSubmitFeedback(sessionId ?? 0);
  const clarification = useSubmitClarification(sessionId ?? 0);
  const deleteEventMutation = useDeleteEvent(sessionId ?? 0);
  const updateEventMutation = useUpdateEvent(sessionId ?? 0);

  // Stable refs for refetch and createEvent to avoid tearing down intervals/callbacks
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const createEventRef = useRef(createEvent);
  createEventRef.current = createEvent;

  // Check if there are any processing events
  const hasProcessingEvents = useMemo(() => {
    return session?.session_events?.some(
      (event) => event.status === 'queued' || event.status === 'processing'
    ) ?? false;
  }, [session?.session_events]);

  // Poll for updates when there are processing events (but not during mutation)
  useEffect(() => {
    // Don't poll while we're creating an event - prevents race conditions
    if (!hasProcessingEvents || createEvent.isPending) return;

    const interval = setInterval(() => {
      if (!isSending.current) {
        refetchRef.current();
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [hasProcessingEvents, createEvent.isPending]);

  // Timer for session duration
  useEffect(() => {
    const startTime = session?.started_at || session?.created_at;
    if (!startTime) return;

    const updateElapsed = () => {
      const elapsed = calculateDuration(startTime, null);
      setElapsedSeconds(elapsed);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [session?.started_at, session?.created_at]);

  // Keep events in chronological order with render-level dedup (Layer 3)
  const sortedEvents = useMemo(() => {
    if (!session?.session_events) return [];

    const seen = new Set<number>();
    const result: SessionEvent[] = [];

    for (const event of session.session_events) {
      // Layer 3: skip optimistic events already resolved by onSuccess
      if (event.id < 0 && createEvent.resolvedOptimisticIds.current.has(event.id)) {
        continue;
      }
      // Belt-and-suspenders: skip duplicate IDs
      if (seen.has(event.id)) {
        continue;
      }
      seen.add(event.id);
      result.push(event);
    }

    return result;
  }, [session?.session_events]);

  // ScrollView ref for auto-scrolling to new events
  const scrollViewRef = useRef<ScrollView>(null);
  const prevEventCount = useRef(0);
  const prevContentHeight = useRef(0);
  const isInitialMount = useRef(true);
  // Track which raw_text values have been animated to prevent double animations
  const animatedTexts = useRef<Set<string>>(new Set());

  // Track last event status for status-change detection
  const lastEventStatus = sortedEvents.length > 0
    ? sortedEvents[sortedEvents.length - 1].status
    : null;
  const prevLastEventStatus = useRef<string | null>(null);

  // Auto-scroll to bottom when:
  // 1. New events are added
  // 2. Last event status changes (bubble size likely changed)
  // 3. Initial mount with events
  useEffect(() => {
    const shouldScroll =
      sortedEvents.length > prevEventCount.current || // New event added
      (lastEventStatus !== prevLastEventStatus.current && sortedEvents.length > 0) || // Status changed
      (isInitialMount.current && sortedEvents.length > 0); // Initial mount

    if (shouldScroll) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: !isInitialMount.current });
      }, 350);
    }

    prevEventCount.current = sortedEvents.length;
    prevLastEventStatus.current = lastEventStatus;
    isInitialMount.current = false;
  }, [sortedEvents.length, lastEventStatus]);

  // Handle content size changes (catches edge cases like bubble height changes)
  const handleContentSizeChange = useCallback((_width: number, height: number) => {
    // Only auto-scroll if content grew (not on shrink)
    if (height > prevContentHeight.current && prevContentHeight.current > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
    prevContentHeight.current = height;
  }, []);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isSending.current) return;

    isSending.current = true;
    try {
      if (editMode && editTarget) {
        await updateEventMutation.mutateAsync({ eventId: editTarget.eventId, rawText: text.trim() });
        setEditMode(false);
        setEditTarget(null);
        setInputText('');
      } else {
        await createEventRef.current.mutateAsync(text.trim());
        setInputText('');
      }
    } catch (error) {
      console.error('Failed to send:', error);
    } finally {
      isSending.current = false;
    }
  }, [editMode, editTarget, updateEventMutation]);

  const handleSelectSuggestion = useCallback((
    eventId: number,
    optionIndex: number,
    feedbackType: 'exercise' | 'unit' | 'structure' | 'note'
  ) => {
    feedback.mutate({ eventId, selectedIndex: optionIndex, feedbackType });
  }, [feedback]);

  const handleSelectClarificationOption = useCallback((eventId: number, optionIndex: number) => {
    clarification.mutate({ type: 'select_option', eventId, selectedIndex: optionIndex });
  }, [clarification]);

  const handleSubmitMissingValue = useCallback((eventId: number, field: 'reps' | 'weight' | 'set_count', value: number) => {
    clarification.mutate({ type: 'provide_value', eventId, field, value });
  }, [clarification]);

  const handleEditRawText = useCallback((eventId: number, currentText: string) => {
    setEditModalEventId(eventId);
    setEditModalText(currentText);
    setEditModalVisible(true);
  }, []);

  const handleCancelEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditModalEventId(null);
    setEditModalText('');
  }, []);

  const handleSubmitEditedText = useCallback((editedText: string) => {
    if (editModalEventId === null) return;
    clarification.mutate(
      { type: 'edit_text', eventId: editModalEventId, editedText },
      {
        onSuccess: () => {
          setEditModalVisible(false);
          setEditModalEventId(null);
          setEditModalText('');
        },
      }
    );
  }, [clarification, editModalEventId]);

  // Edit event via inline bottom logger
  const handleEditEvent = useCallback((eventId: number, rawText: string, exerciseName: string) => {
    setEditTarget({ eventId, exerciseName });
    setInputText(rawText);
    setEditMode(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setEditTarget(null);
    setInputText('');
  }, []);

  // Delete event
  const handleDeleteEvent = useCallback((eventId: number, exerciseName: string) => {
    setDeleteTarget({ eventId, exerciseName });
    setDeleteModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteEventMutation.mutateAsync(deleteTarget.eventId);
      setDeleteSuccess(true);
      setTimeout(() => {
        setDeleteModalVisible(false);
        setDeleteTarget(null);
        setDeleteSuccess(false);
      }, 800);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  }, [deleteTarget, deleteEventMutation]);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalVisible(false);
    setDeleteTarget(null);
  }, []);

  const handleFinish = useCallback(async () => {
    if (!sessionId) return;
    try {
      await finishSession.mutateAsync(sessionId);
      router.replace(`/(tabs)/log/${sessionId}`);
    } catch (error) {
      console.error('Failed to finish session:', error);
    }
  }, [sessionId, finishSession]);

  if (!sessionId) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="font-sans text-neutral-400">Invalid session</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="font-sans text-primary mt-4">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header Skeleton */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            paddingHorizontal: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
          }}
        >
          <Skeleton width={70} height={18} borderRadius={4} />
          <Skeleton width={60} height={18} borderRadius={4} />
          <Skeleton width={60} height={30} borderRadius={10} />
        </View>

        {/* Events Skeleton */}
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, gap: 12 }}>
          <Skeleton width="100%" height={60} borderRadius={16} />
          <Skeleton width="100%" height={100} borderRadius={16} />
          <Skeleton width="100%" height={60} borderRadius={16} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 56,
            paddingHorizontal: 16,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
          }}
        >
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 15,
              color: '#FFFFFF',
            }}
          >
            Workout
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text className="font-sans text-neutral-400 text-base mt-4">Failed to load session</Text>
          <Text className="font-sans text-neutral-600 text-sm mt-1 text-center">
            Check your connection and try again
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-6 px-6 py-3 bg-surface border border-white/10 rounded-xl active:bg-surface-hover"
          >
            <Text className="font-sans-medium text-white">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 56,
          paddingHorizontal: 16,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
        }}
      >
        <Text
          style={{
            fontFamily: 'SpaceGrotesk_600SemiBold',
            fontSize: 15,
            color: '#FFFFFF',
          }}
        >
          Workout
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialIcons name="timer" size={14} color="#9CA3AF" />
          <Text
            style={{
              fontFamily: 'SpaceGrotesk_600SemiBold',
              fontSize: 15,
              color: '#FFFFFF',
            }}
          >
            {formatDuration(elapsedSeconds)}
          </Text>
        </View>

        <Pressable
          onPress={handleFinish}
          disabled={finishSession.isPending}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            paddingVertical: 6,
            paddingHorizontal: 14,
            opacity: finishSession.isPending ? 0.6 : 1,
          }}
        >
          {finishSession.isPending ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Text
              style={{
                fontFamily: 'SpaceGrotesk_700Bold',
                fontSize: 13,
                color: '#121212',
              }}
            >
              Finish
            </Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Event Bubbles */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingHorizontal: 24, paddingVertical: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={handleContentSizeChange}
        >
          {sortedEvents.length === 0 && !createEvent.isPending ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="fitness-center" size={48} color={colors.textDim} />
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  fontSize: 16,
                  color: '#9CA3AF',
                  marginTop: 16,
                }}
              >
                No sets logged yet
              </Text>
              <Text
                style={{
                  fontFamily: 'SpaceGrotesk_400Regular',
                  fontSize: 14,
                  color: '#6B7280',
                  marginTop: 4,
                  textAlign: 'center',
                  paddingHorizontal: 32,
                }}
              >
                Use the input below to log your exercises{'\n'}e.g., "bench 3x8 100kg"
              </Text>
            </View>
          ) : (
            sortedEvents.map((event) => {
              // Track animated texts to prevent double animations when optimistic events resolve
              const shouldAnimate = !animatedTexts.current.has(event.raw_text);
              if (shouldAnimate) {
                animatedTexts.current.add(event.raw_text);
              }

              return (
                <EventBubble
                  key={event.id}
                  event={event}
                  onSelectSuggestion={handleSelectSuggestion}
                  onSelectClarificationOption={handleSelectClarificationOption}
                  onSubmitMissingValue={handleSubmitMissingValue}
                  onEditRawText={handleEditRawText}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                  skipEntranceAnimation={!shouldAnimate}
                />
              );
            })
          )}
        </ScrollView>

        {/* Bottom Logger */}
        <BottomLogger
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={createEvent.isPending || updateEventMutation.isPending}
          editMode={editMode}
          editExerciseName={editTarget?.exerciseName}
          onCancelEdit={handleCancelEdit}
        />
      </KeyboardAvoidingView>

      {/* Edit Raw Text Modal */}
      <EditRawTextModal
        visible={editModalVisible}
        initialText={editModalText}
        isSubmitting={clarification.isPending}
        onCancel={handleCancelEditModal}
        onSubmit={handleSubmitEditedText}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        exerciseName={deleteTarget?.exerciseName ?? ''}
        isDeleting={deleteEventMutation.isPending}
        isDeleted={deleteSuccess}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </SafeAreaView>
  );
}
