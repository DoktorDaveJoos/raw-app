import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { BottomLogger } from '@/components/BottomLogger';
import { EventBubble } from '@/components/session';
import { Skeleton } from '@/components/ui';
import { useSession, useFinishSession, useCreateEvent, useSubmitFeedback } from '@/hooks';
import type { SessionEvent } from '@/lib/api';
import { formatDuration, calculateDuration } from '@/lib/utils';

export default function LoggingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsed = parseInt(id, 10);
  const sessionId = isNaN(parsed) ? undefined : parsed;

  const [inputText, setInputText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const isSending = useRef(false);

  // Fetch session data
  const { data: session, isLoading, isError, refetch } = useSession(sessionId);
  const finishSession = useFinishSession();
  const createEvent = useCreateEvent(sessionId ?? 0);
  const feedback = useSubmitFeedback(sessionId ?? 0);

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

  // Auto-scroll to bottom when new events are added
  useEffect(() => {
    if (sortedEvents.length > prevEventCount.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    prevEventCount.current = sortedEvents.length;
  }, [sortedEvents.length]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isSending.current) return;

    isSending.current = true;
    try {
      await createEventRef.current.mutateAsync(text.trim());
      setInputText('');
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      isSending.current = false;
    }
  }, []);

  const handleSelectSuggestion = useCallback((eventId: number, optionIndex: number) => {
    feedback.mutate({ eventId, selectedIndex: optionIndex });
  }, [feedback]);

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
          <MaterialIcons name="timer" size={14} color={colors.textDim} />
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {sortedEvents.length === 0 && !createEvent.isPending ? (
            <View className="items-center py-16">
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
            sortedEvents.map((event) => (
              <EventBubble
                key={event.id}
                event={event}
                onSelectSuggestion={handleSelectSuggestion}
                onEditRawText={(eventId) => console.log('Edit raw text', eventId)}
              />
            ))
          )}
        </ScrollView>

        {/* Bottom Logger */}
        <BottomLogger
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          disabled={createEvent.isPending}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
