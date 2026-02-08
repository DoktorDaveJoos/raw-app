import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useMemo } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { useSession } from '@/hooks';
import { formatDateTime, formatDuration, calculateDuration } from '@/lib/utils';
import { TopExercisesTable, EventCard } from '@/components/session';
import { Skeleton } from '@/components/ui';
import type { SessionExercise } from '@/lib/api';

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parsed = parseInt(id, 10);
  const sessionId = isNaN(parsed) ? undefined : parsed;

  const { data: session, isLoading, isError, refetch } = useSession(sessionId);

  // Calculate stats from session data
  const stats = useMemo(() => {
    if (!session) {
      return {
        exercises: 0,
        sets: 0,
        reps: 0,
        volume: 0,
        duration: '00:00',
      };
    }

    // Calculate total reps from events
    const totalReps = session.session_events?.reduce((sum, event) => {
      if (event.status !== 'completed' || !event.sets) return sum;
      return sum + event.sets.reduce((setSum, set) => setSum + set.reps, 0);
    }, 0) ?? session.reps_count ?? 0;

    // Calculate duration
    const durationSeconds = session.duration_seconds ??
      calculateDuration(session.started_at, session.finished_at);

    return {
      exercises: session.exercises_count ?? 0,
      sets: session.sets_count ?? 0,
      reps: totalReps,
      volume: session.volume_kg ?? 0,
      duration: formatDuration(durationSeconds),
    };
  }, [session]);

  // Map session exercises to TopExercisesTable format
  const exerciseSummaries = useMemo(() => {
    if (!session?.session_exercises) return [];

    return session.session_exercises.map((ex: SessionExercise) => ({
      exercise_name: ex.exercise_name,
      sets_count: ex.sets_count,
      reps_count: ex.reps_count,
      volume_kg: ex.volume_kg ?? 0,
    }));
  }, [session?.session_exercises]);

  // Filter completed add_sets events for event log
  const completedEvents = useMemo(() => {
    if (!session?.session_events) return [];

    return session.session_events.filter(
      (event) => event.status === 'completed' && event.type === 'add_sets'
    );
  }, [session?.session_events]);

  // Format the session date/time
  const dateTimeDisplay = useMemo(() => {
    if (!session?.started_at) return '';
    return formatDateTime(session.started_at);
  }, [session?.started_at]);

  const handleBack = () => {
    router.navigate('/(tabs)/log');
  };

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

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share session', sessionId);
  };

  // Format volume for display
  const formatVolume = (kg: number): string => {
    return kg.toLocaleString();
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        {/* Header Skeleton */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="p-2 w-10" />
          <View className="flex-1 items-center">
            <Skeleton width={160} height={22} borderRadius={4} style={{ marginBottom: 4 }} />
            <Skeleton width={140} height={16} borderRadius={4} />
          </View>
          <View className="p-2 w-10" />
        </View>

        <ScrollView className="flex-1">
          {/* Stats Skeleton */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 py-4"
            contentContainerStyle={{ gap: 12 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} width={100} height={72} borderRadius={16} />
            ))}
          </ScrollView>

          {/* Top Exercises Skeleton */}
          <View className="px-4 mt-4">
            <Skeleton width={120} height={22} borderRadius={4} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={180} borderRadius={16} />
          </View>

          {/* Event Log Skeleton */}
          <View className="px-4 mt-6">
            <Skeleton width={100} height={22} borderRadius={4} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={200} borderRadius={24} style={{ marginBottom: 16 }} />
            <Skeleton width="100%" height={180} borderRadius={24} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="flex-row items-center px-4 py-3">
          <Pressable onPress={handleBack} className="p-2">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text className="font-sans-semibold flex-1 text-white text-lg text-center">Session</Text>
          <View className="p-2 w-10" />
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

  if (!session) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <MaterialIcons name="error-outline" size={48} color={colors.textDim} />
        <Text className="font-sans text-neutral-400 text-base mt-4">Session not found</Text>
        <Pressable
          onPress={handleBack}
          className="mt-4 px-4 py-2 bg-surface rounded-lg"
        >
          <Text className="font-sans text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={handleBack} className="p-2">
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </Pressable>
        <View className="flex-1 items-center">
          <Text className="font-sans-semibold text-white text-lg" numberOfLines={1}>
            {session.title || 'Workout Session'}
          </Text>
          <Text className="font-sans text-neutral-500 text-sm">{dateTimeDisplay}</Text>
        </View>
        <Pressable onPress={handleShare} className="p-2">
          <MaterialIcons name="share" size={24} color={colors.textMuted} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-4"
          contentContainerStyle={{ gap: 12 }}
        >
          <StatCard label="Exercises" value={stats.exercises.toString()} />
          <StatCard label="Sets" value={stats.sets.toString()} />
          <StatCard label="Reps" value={stats.reps.toString()} />
          <StatCard label="Volume" value={formatVolume(stats.volume)} suffix="kg" />
          <StatCard label="Duration" value={stats.duration} />
        </ScrollView>

        {/* Top Exercises */}
        <View className="px-4 mt-4">
          <Text className="font-sans-semibold text-white text-lg mb-4">Top Exercises</Text>
          <TopExercisesTable exercises={exerciseSummaries} />
        </View>

        {/* Event Log */}
        <View className="px-4 mt-6 pb-8">
          <Text className="font-sans-semibold text-white text-lg mb-4">Event Log</Text>

          {completedEvents.length === 0 ? (
            <View className="bg-surface rounded-2xl border border-white/5 px-4 py-8 items-center">
              <MaterialIcons name="history" size={32} color={colors.textDim} />
              <Text className="font-sans text-neutral-500 text-sm mt-2">No events recorded</Text>
            </View>
          ) : (
            completedEvents.map((event) => (
              <View key={event.id} className="mb-4">
                <EventCard
                  exerciseName={event.exercise_name || 'Unknown Exercise'}
                  rawText={event.raw_text}
                  sets={event.sets || []}
                  readOnly
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
}

function StatCard({ label, value, suffix }: StatCardProps) {
  return (
    <View className="bg-surface rounded-2xl px-4 py-3 min-w-[100px] border border-white/5">
      <Text className="font-sans text-neutral-500 text-xs uppercase tracking-wider mb-1">{label}</Text>
      <View className="flex-row items-baseline">
        <Text className="font-sans-bold text-white text-2xl">{value}</Text>
        {suffix && <Text className="font-sans text-neutral-500 text-sm ml-1">{suffix}</Text>}
      </View>
    </View>
  );
}
