import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { BottomLogger } from '@/components/BottomLogger';
import { EventCard, ProcessingCard } from '@/components/session';
import { Skeleton } from '@/components/ui';
import { useSession, useFinishSession, useCreateEvent } from '@/hooks';
import { formatDuration, calculateDuration } from '@/lib/utils';
import type { SessionEvent } from '@/lib/api';

export default function LoggingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessionId = parseInt(id, 10);

  const [inputText, setInputText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch session data
  const { data: session, isLoading, isError, refetch } = useSession(sessionId);
  const finishSession = useFinishSession();
  const createEvent = useCreateEvent(sessionId);

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
      refetch();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [hasProcessingEvents, createEvent.isPending, refetch]);

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

  // Extract recent exercises from completed events for chips
  const recentExercises = useMemo(() => {
    if (!session?.session_events) return [];

    const exerciseNames = session.session_events
      .filter((e) => e.status === 'completed' && e.exercise_name)
      .map((e) => e.exercise_name!)
      .slice(0, 3);

    // Remove duplicates
    return [...new Set(exerciseNames)];
  }, [session?.session_events]);

  // Calculate total volume from completed events
  const totalVolume = useMemo(() => {
    if (!session?.session_events) return 0;

    return session.session_events.reduce((sum, event) => {
      if (event.status !== 'completed' || !event.sets) return sum;

      const eventVolume = event.sets.reduce((setSum, set) => {
        return setSum + (set.weight_kg || 0) * set.reps;
      }, 0);

      return sum + eventVolume;
    }, 0);
  }, [session?.session_events]);

  // Keep events in chronological order (oldest first, newest at bottom)
  const sortedEvents = useMemo(() => {
    if (!session?.session_events) return [];
    return [...session.session_events];
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

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      try {
        await createEvent.mutateAsync(text.trim());
        setInputText('');
      } catch (error) {
        console.error('Failed to create event:', error);
      }
    },
    [createEvent]
  );

  const handleChipPress = useCallback((chip: string) => {
    setInputText((prev) => (prev ? `${prev} ${chip}` : chip));
  }, []);

  const handleFinish = useCallback(async () => {
    try {
      await finishSession.mutateAsync(sessionId);
      router.replace(`/(tabs)/log/${sessionId}`);
    } catch (error) {
      console.error('Failed to finish session:', error);
    }
  }, [sessionId, finishSession]);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  // Format volume for display
  const formatVolume = (kg: number): string => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return kg.toLocaleString();
  };

  // Render event card - defensive logic that never returns null
  const renderEventCard = (event: SessionEvent) => {
    // Processing states (queued or processing)
    if (event.status === 'queued' || event.status === 'processing') {
      return (
        <ProcessingCard
          rawText={event.raw_text}
          expectedSets={3}
        />
      );
    }

    // Failed state
    if (event.status === 'failed') {
      return (
        <View className="bg-surface border border-red-500/30 rounded-3xl p-4">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="error-outline" size={20} color="#ef4444" />
            <Text className="text-red-400 text-sm font-medium ml-2">
              Failed to parse
            </Text>
          </View>
          <Text className="text-neutral-400 text-xs font-mono">
            {event.raw_text}
          </Text>
        </View>
      );
    }

    // Completed add_sets → full EventCard
    if (event.status === 'completed' && event.type === 'add_sets') {
      return (
        <EventCard
          exerciseName={event.exercise_name || 'Unknown Exercise'}
          rawText={event.raw_text}
          sets={event.sets || []}
          onEdit={() => console.log('Edit', event.id)}
          onMore={() => console.log('More', event.id)}
        />
      );
    }

    // Completed other types → generic completed card (never hide)
    if (event.status === 'completed') {
      return (
        <View className="bg-surface border border-white/10 rounded-3xl p-4">
          <View className="flex-row items-center mb-2">
            <MaterialIcons name="check-circle" size={20} color="#22c55e" />
            <Text className="text-green-400 text-sm font-medium ml-2">
              {event.type || 'Event'}
            </Text>
          </View>
          <Text className="text-neutral-400 text-xs font-mono">
            {event.raw_text}
          </Text>
        </View>
      );
    }

    // Fallback for any unknown state (safety net - should never reach here)
    return (
      <View className="bg-surface border border-yellow-500/30 rounded-3xl p-4">
        <View className="flex-row items-center mb-2">
          <MaterialIcons name="help-outline" size={20} color="#eab308" />
          <Text className="text-yellow-400 text-sm font-medium ml-2">
            Unknown status: {event.status}
          </Text>
        </View>
        <Text className="text-neutral-400 text-xs font-mono">
          {event.raw_text}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5">
          <View className="h-10 w-10" />
          <Skeleton width={140} height={20} borderRadius={4} />
          <View className="h-10 w-16" />
        </View>

        {/* Stats Skeleton */}
        <View className="flex-row items-center justify-center gap-12 py-3 border-b border-white/5">
          <View className="items-center">
            <Skeleton width={50} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={70} height={16} borderRadius={4} />
          </View>
          <View className="w-px h-6 bg-white/10" />
          <View className="items-center">
            <Skeleton width={50} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={50} height={16} borderRadius={4} />
          </View>
        </View>

        {/* Events Skeleton */}
        <ScrollView className="flex-1 px-4 pt-6">
          <Skeleton width="100%" height={180} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={200} borderRadius={24} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={180} borderRadius={24} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center px-4 py-3 border-b border-white/5">
          <Pressable onPress={handleBack} className="h-10 w-10 items-center justify-center">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="flex-1 text-white font-bold text-base text-center">Session</Text>
          <View className="h-10 w-10" />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text className="text-neutral-400 text-base mt-4">Failed to load session</Text>
          <Text className="text-neutral-600 text-sm mt-1 text-center">
            Check your connection and try again
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-6 px-6 py-3 bg-surface border border-white/10 rounded-xl active:bg-surface-hover"
          >
            <Text className="text-white font-medium">Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Sticky Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5">
        <Pressable
          onPress={handleBack}
          className="h-10 w-10 items-center justify-center"
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View className="items-center">
          <Text className="text-white font-bold text-base">
            {session?.title || "Today's Session"}
          </Text>
          <Text className="text-neutral-400 text-xs">
            {formatDuration(elapsedSeconds)}
          </Text>
        </View>
        <Pressable
          onPress={handleFinish}
          disabled={finishSession.isPending}
          className="h-10 px-2 items-center justify-center"
        >
          {finishSession.isPending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text className="text-primary text-sm font-bold tracking-wide">Finish</Text>
          )}
        </Pressable>
      </View>

      {/* Stats Row */}
      <View className="flex-row items-center justify-center gap-12 py-3 border-b border-white/5">
        <View className="items-center">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">
            Volume
          </Text>
          <Text className="text-white font-semibold text-sm tracking-wide">
            {formatVolume(totalVolume)}{' '}
            <Text className="text-neutral-500 font-normal">kg</Text>
          </Text>
        </View>
        <View className="w-px h-6 bg-white/10" />
        <View className="items-center">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-0.5">
            Duration
          </Text>
          <Text className="text-white font-semibold text-sm tracking-wide">
            {formatDuration(elapsedSeconds)}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Event Cards */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: 280 }}
          showsVerticalScrollIndicator={false}
        >
          {sortedEvents.length === 0 && !createEvent.isPending ? (
            <View className="items-center py-16">
              <MaterialIcons name="fitness-center" size={48} color={colors.textDim} />
              <Text className="text-neutral-400 text-base mt-4">No sets logged yet</Text>
              <Text className="text-neutral-600 text-sm mt-1 text-center px-8">
                Use the AI Logger below to log your exercises{'\n'}e.g., "bench 3x8 100kg"
              </Text>
            </View>
          ) : (
            sortedEvents.map((event) => (
              <View key={event.id} className="mb-5">
                {renderEventCard(event)}
              </View>
            ))
          )}
        </ScrollView>

        {/* Bottom Logger */}
        <BottomLogger
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          onChipPress={handleChipPress}
          recentExercises={recentExercises}
          disabled={createEvent.isPending}
          onUndo={() => console.log('Undo')}
          onEdit={() => console.log('Edit last')}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
