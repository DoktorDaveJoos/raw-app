import { View, Text, Pressable, FlatList, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState, useCallback } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { formatRelativeTime } from '@/lib/utils';
import { useSessions, useCurrentSession, useCreateAndStartSession } from '@/hooks';
import { Skeleton } from '@/components/ui';
import type { WorkoutSessionSummary } from '@/lib/api';

export default function LogScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const { data: sessionsResponse, isLoading, isError, refetch } = useSessions();
  const { data: currentSession, refetch: refetchCurrent } = useCurrentSession();
  const createAndStart = useCreateAndStartSession();

  const sessions = sessionsResponse?.data ?? [];

  // Separate current and finished sessions
  const finishedSessions = sessions.filter((s) => s.status === 'finished');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchCurrent()]);
    setRefreshing(false);
  }, [refetch, refetchCurrent]);

  const handleNewWorkout = async () => {
    try {
      const session = await createAndStart.mutateAsync('Free Training');
      router.push(`/logging/${session.id}`);
    } catch (error) {
      Alert.alert('Unable to Create Workout', 'Please check your connection and try again.');
    }
  };

  const handleSessionPress = (session: WorkoutSessionSummary) => {
    if (session.status === 'in_progress') {
      router.push(`/logging/${session.id}`);
    } else {
      router.push(`/(tabs)/log/${session.id}`);
    }
  };

  const renderSession = ({ item, index }: { item: WorkoutSessionSummary; index: number }) => (
    <SessionRow
      session={item}
      onPress={() => handleSessionPress(item)}
      isFirst={index === 0}
      isLast={index === finishedSessions.length - 1}
    />
  );

  const ListHeader = () => (
    <>
      {/* Current Session Card */}
      {currentSession && (
        <View className="mb-4">
          <CurrentSessionCard
            session={currentSession}
            onPress={() => handleSessionPress(currentSession)}
          />
        </View>
      )}

      {/* History Header - only show if there are finished sessions */}
      {finishedSessions.length > 0 && (
        <View className="mb-2">
          <Text className="font-sans-bold text-xs uppercase tracking-widest text-neutral-500 px-1">
            History
          </Text>
        </View>
      )}
    </>
  );

  const ListEmpty = () => (
    <View className="items-center py-12">
      {isLoading ? (
        <View className="w-full">
          <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={80} borderRadius={16} style={{ marginBottom: 12 }} />
          <Skeleton width="100%" height={80} borderRadius={16} />
        </View>
      ) : isError ? (
        <View className="items-center">
          <MaterialIcons name="error-outline" size={48} color="#ef4444" />
          <Text className="font-sans text-neutral-400 text-base mt-4">Failed to load workouts</Text>
          <Text className="font-sans text-neutral-600 text-sm mt-1">
            Check your connection and try again
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 px-6 py-3 bg-surface border border-white/10 rounded-xl active:bg-surface-hover"
          >
            <Text className="font-sans-medium text-white">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <MaterialIcons name="fitness-center" size={48} color={colors.textDim} />
          <Text className="font-sans text-neutral-400 text-base mt-4">No workouts yet</Text>
          <Text className="font-sans text-neutral-600 text-sm mt-1">
            Start your first workout to see it here
          </Text>
        </>
      )}
    </View>
  );

  const ListFooter = () => (
    finishedSessions.length > 0 ? (
      <View className="items-center py-6">
        <Text className="font-sans text-neutral-600 text-xs tracking-wide">End of history</Text>
      </View>
    ) : null
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-white/5">
        <Text className="font-sans-bold text-xl tracking-tight text-white">Workouts</Text>
        <Pressable
          className="flex-row items-center bg-primary px-3 py-1.5 rounded-full active:opacity-80"
          onPress={handleNewWorkout}
          disabled={createAndStart.isPending}
        >
          {createAndStart.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="add" size={18} color="white" />
              <Text className="font-sans-semibold text-white text-xs tracking-wide ml-1">
                New Workout
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {/* Sessions List */}
      <FlatList
        data={finishedSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ItemSeparatorComponent={() => <View className="h-px bg-white/5" />}
      />
    </SafeAreaView>
  );
}

interface CurrentSessionCardProps {
  session: WorkoutSessionSummary;
  onPress: () => void;
}

function CurrentSessionCard({ session, onPress }: CurrentSessionCardProps) {
  return (
    <Pressable
      className="bg-surface rounded-2xl border border-primary/20 p-4 active:bg-surface-hover"
      onPress={onPress}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-sans-semibold text-xs text-primary">Your current training</Text>
        <View className="px-2 py-0.5 rounded-full bg-primary/20 border border-primary/20">
          <Text className="font-sans-bold text-[10px] uppercase tracking-wider text-primary">
            In Progress
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-sans-medium text-white text-base">
            {session.title || 'Untitled Workout'}
          </Text>
          <Text className="font-sans text-neutral-500 text-xs mt-0.5">
            Started {formatRelativeTime(session.started_at)}
          </Text>
          <Text className="font-sans text-neutral-500 text-xs mt-1">
            {session.exercises_count} exercises • {session.sets_count} sets
          </Text>
        </View>

        {/* Resume Button */}
        <Pressable
          className="bg-white/10 px-4 py-2 rounded-lg active:bg-white/20"
          onPress={onPress}
        >
          <Text className="font-sans-semibold text-white text-xs">Resume</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

interface SessionRowProps {
  session: WorkoutSessionSummary;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function SessionRow({ session, onPress, isFirst, isLast }: SessionRowProps) {
  const dateDisplay = session.finished_at
    ? formatRelativeTime(session.finished_at)
    : formatRelativeTime(session.started_at);

  return (
    <Pressable
      className={`bg-surface p-4 active:bg-surface-hover ${isFirst ? 'rounded-t-2xl' : ''} ${isLast ? 'rounded-b-2xl' : ''}`}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          {/* Date and Badge Row */}
          <View className="flex-row items-center justify-between mb-1">
            <Text className="font-sans-medium text-sm text-white">{dateDisplay}</Text>
            <View className="px-2 py-0.5 rounded-full bg-neutral-800 border border-neutral-700">
              <Text className="font-sans-bold text-[10px] uppercase tracking-wider text-neutral-400">
                Finished
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text className="font-sans text-white/90 text-sm">
            {session.title || 'Untitled Workout'}
          </Text>

          {/* Summary */}
          <Text className="font-sans text-neutral-500 text-xs mt-1">
            {session.exercises_count} exercise{session.exercises_count !== 1 ? 's' : ''} • {session.sets_count} set{session.sets_count !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Visibility Icon */}
        <MaterialIcons name="visibility" size={20} color={colors.textDim} style={{ marginLeft: 12 }} />
      </View>
    </Pressable>
  );
}
