import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { colors } from '@/lib/theme';
import { WeeklyStatsCarousel, TodayFocusCard } from '@/components/home';
import { useWeeklyStats, useCurrentSession, useCreateAndStartSession } from '@/hooks';
import { Skeleton } from '@/components/ui';

export default function HomeScreen() {
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Fetch data
  const { data: weeklyStats, isLoading: isLoadingStats, isError: isStatsError, refetch: refetchStats } = useWeeklyStats();
  const { data: currentSession, isLoading: isLoadingCurrent, isError: isCurrentError, refetch: refetchCurrent } = useCurrentSession();
  const createAndStart = useCreateAndStartSession();

  // Default stats while loading
  const stats = weeklyStats ?? {
    volume: 0,
    workouts: 0,
    workoutsTarget: 5,
    avgIntensity: 0,
  };

  // Mock exercise data - would come from a workout plan API
  const todayExercises = [
    { name: 'Bench Press', sets: 3, reps: 5 },
    { name: 'Weighted Pull-up', sets: 3, reps: 6 },
    { name: 'Overhead Press', sets: 3, reps: 8 },
  ];

  const handleStartWorkout = async () => {
    if (currentSession) {
      // Resume existing session
      router.push(`/(tabs)/log/logging/${currentSession.id}`);
    } else {
      // Create and start new session
      try {
        const session = await createAndStart.mutateAsync('Upper Body Power');
        router.push(`/(tabs)/log/logging/${session.id}`);
      } catch (error) {
        Alert.alert('Unable to Start Workout', 'Please check your connection and try again.');
      }
    }
  };

  const handleStartFreeWorkout = async () => {
    try {
      const session = await createAndStart.mutateAsync('Free Training');
      router.push(`/(tabs)/log/logging/${session.id}`);
    } catch (error) {
      Alert.alert('Unable to Start Workout', 'Please check your connection and try again.');
    }
  };

  const isStarting = createAndStart.isPending;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
          <View>
            <Text className="text-2xl font-bold text-white">Today</Text>
            <Text className="text-neutral-500 text-sm mt-0.5">{dateString}</Text>
          </View>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface border border-white/5">
            <MaterialIcons name="notifications" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Weekly Stats */}
        <View className="mt-6">
          <View className="px-6 mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Weekly Stats
            </Text>
          </View>
          {isLoadingStats ? (
            <View className="px-6 flex-row gap-4">
              <Skeleton width={140} height={120} borderRadius={16} />
              <Skeleton width={140} height={120} borderRadius={16} />
              <Skeleton width={140} height={120} borderRadius={16} />
            </View>
          ) : isStatsError ? (
            <View className="px-6">
              <View className="bg-surface rounded-2xl border border-red-500/20 p-4 items-center">
                <MaterialIcons name="error-outline" size={24} color="#ef4444" />
                <Text className="text-neutral-400 text-sm mt-2">Failed to load stats</Text>
                <Pressable
                  onPress={() => refetchStats()}
                  className="mt-3 px-4 py-2 bg-white/10 rounded-lg active:bg-white/20"
                >
                  <Text className="text-white text-xs font-medium">Retry</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <WeeklyStatsCarousel stats={stats} />
          )}
        </View>

        {/* Today's Focus */}
        <View className="px-6 mt-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest text-neutral-500">
              Today's Focus
            </Text>
            <Pressable>
              <Text className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Edit
              </Text>
            </Pressable>
          </View>

          {isLoadingCurrent ? (
            <View className="bg-surface rounded-3xl p-6 border border-white/5">
              <Skeleton width={80} height={24} borderRadius={12} style={{ marginBottom: 12 }} />
              <Skeleton width="70%" height={28} borderRadius={4} style={{ marginBottom: 8 }} />
              <Skeleton width="50%" height={16} borderRadius={4} style={{ marginBottom: 24 }} />
              <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={48} borderRadius={12} style={{ marginBottom: 24 }} />
              <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 12 }} />
              <Skeleton width="100%" height={48} borderRadius={12} />
            </View>
          ) : isCurrentError ? (
            <View className="bg-surface rounded-3xl p-6 border border-red-500/20 items-center">
              <MaterialIcons name="error-outline" size={32} color="#ef4444" />
              <Text className="text-neutral-400 text-sm mt-3">Failed to load workout info</Text>
              <Pressable
                onPress={() => refetchCurrent()}
                className="mt-4 px-6 py-2 bg-white/10 rounded-lg active:bg-white/20"
              >
                <Text className="text-white text-sm font-medium">Retry</Text>
              </Pressable>
            </View>
          ) : (
            <TodayFocusCard
              title="Upper Body Power"
              category="Strength"
              duration="45 min"
              intensity="High Intensity"
              exercises={todayExercises}
              totalExercises={6}
              onStartWorkout={handleStartWorkout}
              onStartFreeWorkout={handleStartFreeWorkout}
              isResuming={!!currentSession}
            />
          )}

          {/* Current Session Indicator */}
          {currentSession && !isLoadingCurrent && (
            <View className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-2xl">
              <View className="flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-primary mr-2" />
                <Text className="text-primary text-sm font-medium">
                  You have a workout in progress
                </Text>
              </View>
              <Text className="text-neutral-400 text-xs mt-1">
                Started {formatTimeAgo(currentSession.started_at)}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View className="h-24" />
      </ScrollView>

      {/* Loading overlay when starting */}
      {isStarting && (
        <View className="absolute inset-0 bg-background/80 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-white mt-4">Starting workout...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'recently';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
